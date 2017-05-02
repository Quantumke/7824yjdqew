##   -*- coding:utf-8 -*-
import os,django,datetime,uuid,string,random,hashlib,sys, traceback, json
from django.utils import timezone
from django.db import IntegrityError
from django.db.models import Q
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "betmaster.settings")
django.setup()
from AfricasTalkingGateway import AfricasTalkingGateway, AfricasTalkingGatewayException
from django.contrib.auth.models import User
try:
    User.objects.create_superuser(username='yonny', password='yonny76987985176253', email='yonny@saiba.com')
except Exception,ex:
    print ex

from kafka import KafkaConsumer
from sms.models  import *
KAFKA_SERVERS = ['localhost:9092']


AT_USERNAME = "bet360"
AT_APIKEY   = "516f7e54a9349bb84e3e1877440a5f8a58d9bbb6cefa154ae5aa35bb65a955e8"
AT_SHORTCODE = "22779"

RETRY_DURATION_IN_HOURS = 12
BULK_SMS_MODE = 0
QUEUE_NAME="send_sms"
#to      = "+254711XXXYYY"


message = "Get your daily message and thats how we roll.";

# Specify your premium shortCode and keyword
# Set keyword as None where not used (Mostly for onDemand services)

shortCode = "XXXXX"
keyword   = "premiumKeyword" # keyword = None

# Set the bulkSMSMode flag to 0 so that the subscriber gets charged


# Set the enqueue flag to 0 so that your message will not be queued or to 1 for many messages
enqueue    = 0

# Incase of an onDemand service, specify the link id. else set it to none
# linkId is received from the message sent by subscriber to your onDemand service
linkId = "messageLinkId" #linkId = None

# Specify retryDurationInHours: The numbers of hours our API should retry to send the message
# incase it doesn't go through. It is optional
retryDurationInHours = "No of hours to retry"

AT_GATEWAY = AfricasTalkingGateway(AT_USERNAME, AT_APIKEY)


def add_message_out(mobile_number,link_id,text,message_id,keyword,status):
    try:
        s = MessageOut()
        s.mobile_number = mobile_number
        s.link_id = link_id
        s.text = text
        s.status = status
        s.message_id = message_id
        s.sub_date = timezone.now() #todo - parse date
        s.keyword = keyword
        s.save()
    except Exception,ex:
        print ex


def send_sms(mobile_number,text,keyword,linkId=""):
    try:

        recipients = AT_GATEWAY.sendMessage("+"+mobile_number, text, AT_SHORTCODE, BULK_SMS_MODE, enqueue, keyword, linkId, RETRY_DURATION_IN_HOURS)
        for recipient in recipients:
            print 'number=%s;status=%s;messageId=%s' % (recipient['number'],recipient['status'],recipient['messageId'])
            add_message_out(recipient['number'],linkId,text,recipient['messageId'],keyword,recipient['status'])
    except AfricasTalkingGatewayException, e:
        print 'Encountered an error while sending: %s' % str(e)



print  "SMS Send Queue Processor \nConnected to Kafka at "+str(KAFKA_SERVERS)+"\nWaiting...."
try:
    consumer = KafkaConsumer(QUEUE_NAME,bootstrap_servers=KAFKA_SERVERS)
    for message in consumer:
            try:
                info = json.loads(message.value)
                send_sms(info['mobile_number'],info['text'],info['keyword'],linkId=info.get("link_id",""))
            except Exception,ex:
                import traceback
                print ex
                traceback.print_exc()
except KafkaConfigurationError,ex:
    print ex
    print "kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic "+QUEUE_NAME
