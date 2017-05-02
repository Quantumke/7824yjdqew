from django.shortcuts import render

from AfricasTalkingGateway import AfricasTalkingGateway, AfricasTalkingGatewayException
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
import json, phonenumbers, traceback, datetime
from sms.models import *

AT_USERNAME = "bet360"
AT_APIKEY   = "516f7e54a9349bb84e3e1877440a5f8a58d9bbb6cefa154ae5aa35bb65a955e8"
AT_SHORTCODE = "22779"
AT_GATEWAY = AfricasTalkingGateway(AT_USERNAME, AT_APIKEY)


DEFAULT_TEXT="""You have requested a prediction using an invalid format! SMS to 22779 "P" and the "Game ID" of the game whose prediction you want to request e.g. P#1, P#2, P#3"""
OFFLINE_MSG="Welcome to Bet360 VIP Prediction Service (VIPPS)! The service is currently unavailable since some games have already started or have completed #BetBetter"
KEYWORDS_M = {}
for x in Keyword.objects.all():
    try:
        KEYWORDS_M[x.text.upper()] = x.id
        KEYWORDS_M[x.text.lower()] = x.id
    except Exception,ex:
        print ex


def lookup_odtext(game_id):
    try:
        x = OnDemandPredictionText.objects.get(send_date=datetime.date.today(),game_id=game_id).text
        return x
    except Exception,ex:
        print ex
    return DEFAULT_TEXT


def get_sub_text(keyword_text):
    if len(KEYWORDS_M) == 0:
        return DEFAULT_TEXT
    time_now = int(datetime.datetime.now().strftime("%H"))
    print time_now
    if 1 < time_now <= 5:
        return OFFLINE_MSG

    if 5 < time_now < 13:
        return DEFAULT_TEXT
    keyword_id = KEYWORDS_M[keyword_text]
    try:
        s = SubscriptionText.objects.get(keyword_id = keyword_id,send_date=datetime.datetime.today())
        return s.text
    except Exception,ex:
        print ex,"aaa"
    return DEFAULT_TEXT


from kafka import KafkaConsumer, KafkaProducer
SEND_SMS_QUEUE = "send_sms"
SEND_SMS_QUEUE_HOST=['127.0.0.1:9092']
try:
    SEND_SMS_QPRODUCER = KafkaProducer(bootstrap_servers=SEND_SMS_QUEUE_HOST)
except Exception,ex:
    traceback.print_exc()
    print " SEND_SMS_QUEUE Kafka NOT UP !!!!"




SEND_TEXT = open("/opt/bet-text",'r').read()

def render_json(obj):
    data = json.dumps(obj)
    return HttpResponse(data, content_type='application/json')

def normalize_phone_number(mobile,country_code):
    try:
        pnum = phonenumbers.parse(mobile, country_code)
        return phonenumbers.format_number(pnum, phonenumbers.PhoneNumberFormat.E164)[1:]
    except Exception,ex:
        print ex
        return mobile



def add_message_in(mobile_number,to,text,link_id,message_id,post_date):
    try:
        s = MessageIn()
        s.mobile_number = mobile_number
        s.to = to
        s.text = text
        s.link_id = link_id
        s.message_id = message_id
        s.post_date = timezone.now() #todo - parse date
        s.save()
    except Exception,ex:
        print ex




def add_subscription(mobile_number,keyword):
    try:
        s = Subscription()
        s.mobile_number = mobile_number
        s.is_active = True
        s.keyword = keyword
        s.save()
    except Exception,ex:
        try:
            s = Subscription.objects.get(mobile_number=mobile_number,keyword=keyword)
            s.is_active = True
            s.save()
        except Exception,ex:
            print ex

def disable_subscription(mobile_number,keyword):
    try:
        s = Subscription.objects.get(mobile_number=mobile_number,keyword=keyword)
        s.is_active = False
        s.unsub_date = timezone.now()
        s.save()
    except Exception,ex:
        print ex


def update_message_status(message_id,status,reason):
    try:
        s = MessageOut.objects.get(message_id=message_id)
        s.status = status
        s.reason = reason
        s.save()
    except Exception,ex:
        print ex




@csrf_exempt
def prediction_subscription(request):
    phoneNumber = request.POST.get("phoneNumber","")
    shortCode = request.POST.get("shortCode","")
    keyword = request.POST.get("keyword","")
    updateType = request.POST.get("updateType","")
    keyword = keyword.strip()



    if phoneNumber !="":#todo normalize phone_number
        phoneNumber = normalize_phone_number(phoneNumber,"KE")
        if updateType == "Addition":
            add_subscription(phoneNumber,keyword)
            try:
                to_send = {"mobile_number":phoneNumber,"text":get_sub_text(keyword),"keyword":keyword}
                print to_send,'sending..'
                #SEND_SMS_QPRODUCER.send(SEND_SMS_QUEUE, json.dumps(to_send))
                #SEND_SMS_QPRODUCER.flush()
            except Exception,ex:
                print ex
        if updateType == "Deletion":
            disable_subscription(phoneNumber,keyword)

    return render_json({"status":"A-OK"})



@csrf_exempt
def active_prediction_subscribe_user(request):
    phoneNumber = request.POST.get("phoneNumber","")
    keyword = request.POST.get("keyword","")
    phoneNumber = normalize_phone_number(phoneNumber,"KE")

    try:
        response = AT_GATEWAY.createSubscription(phoneNumber, AT_SHORTCODE, keyword)
    except AfricasTalkingGatewayException as e:
        print "Error:%s" %str(e)
    else:
        #Only status Success signifies the subscription was successfully
        print "Status: %s \n Description: %s" %(response.status, response.description)
        if response.status == "Success":
            add_subscription(phoneNumber,keyword)

    return render_json({"status":"A-OK"})


DELIVERY_REPORT_STATUS =  {
        'Sent' : 1,
        'Submitted' : 2,
        'Buffered' : 3,
        'Rejected' : 4,
        'Success' : 5,
        'Failed' : 6
}

#nohup /opt/kafka_2.11-0.8.2.1/bin/kafka-server-start.sh /opt/kafka_2.11-0.8.2.1/config/server.properties > /tmp/kafka.log 2>&1 &

@csrf_exempt
def receive_delivery_report(request):
    message_id = request.POST.get("id","")
    status = request.POST.get("status","")
    reason = request.POST.get("failureReason","XX")
    if message_id !="":
        update_message_status(message_id,status,reason)
    return render_json({"status":"A-OK"})



@csrf_exempt
def message_receive(request):
    from_ = request.POST.get("from","")
    mobile_number = normalize_phone_number(from_,"KE")
    to_ = request.POST.get("to","")
    text_ = request.POST.get("text","")
    date_ = request.POST.get("date","")
    message_id = request.POST.get("id","")
    link_id = request.POST.get("linkId","")

    if mobile_number!="":
        add_message_in(mobile_number,to_,text_,link_id,message_id,datetime.datetime.now())
        game_id = text_.split("#")[1]
	print "Requested",text_,game_id

        time_now = int(datetime.datetime.now().strftime("%H"))
        print time_now
        if 1 < time_now <= 8:
            return render_json({"status":"A-OK"})

        try:
                to_send = {"mobile_number":mobile_number,"text":lookup_odtext(game_id),"keyword":"P","link_id":link_id}
                print to_send,'sending..'
                SEND_SMS_QPRODUCER.send(SEND_SMS_QUEUE, json.dumps(to_send))
                SEND_SMS_QPRODUCER.flush()
        except Exception,ex:
                print ex
    return render_json({"status":"A-OK"})
