##   -*- coding:utf-8 -*-
import os,django,datetime,uuid,string,random,hashlib,sys, traceback
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
import json, phonenumbers, traceback, datetime
from sms.models import *
from kafka import KafkaConsumer, KafkaProducer

KAFKA_SERVERS = ['localhost:9092']
AT_USERNAME = "bet360"
AT_APIKEY   = "516f7e54a9349bb84e3e1877440a5f8a58d9bbb6cefa154ae5aa35bb65a955e8"
AT_SHORTCODE = "22779"
RETRY_DURATION_IN_HOURS = 12
BULK_SMS_MODE = 0
SEND_SMS_QUEUE="send_sms"
enqueue    = 0

AT_GATEWAY = AfricasTalkingGateway(AT_USERNAME, AT_APIKEY)
#AT_GATEWAY.sendMessage("+254723416855", "test", AT_SHORTCODE, BULK_SMS_MODE, enqueue, "P1", "link9826938746234", RETRY_DURATION_IN_HOURS)


print  "SMS Subscriptions Send Queue Processor \nConnected to Kafka at "+str(KAFKA_SERVERS)+"\nWaiting...."


KEYWORDS_M = {}
for x in Keyword.objects.all():
    try:
        KEYWORDS_M[x.text.upper()] = x.id
        KEYWORDS_M[x.text.lower()] = x.id
    except Exception,ex:
        print ex

def get_sub_text(keyword_text):
    if len(KEYWORDS_M) == 0:
        return DEFAULT_TEXT
    time_now = int(datetime.datetime.now().strftime("%H"))
    print time_now
    if 5 < time_now < 13:
        return DEFAULT_TEXT
    keyword_id = KEYWORDS_M[keyword_text]
    try:
        s = SubscriptionText.objects.get(keyword_id = keyword_id,send_date=datetime.datetime.today())
        return s.text
    except Exception,ex:
        print ex,"aaa"
    return DEFAULT_TEXT

SEND_SMS_QUEUE_HOST=['127.0.0.1:9092']
try:
    SEND_SMS_QPRODUCER = KafkaProducer(bootstrap_servers=SEND_SMS_QUEUE_HOST)
except Exception,ex:
    traceback.print_exc()
    print " SEND_SMS_QUEUE Kafka NOT UP !!!!"


for user in Subscription.objects.filter(is_active=True):
    try:
        print user
        to_send = {"mobile_number":user.mobile_number,"text":get_sub_text(user.keyword),"keyword":user.keyword}
        print to_send,'sending..'
        SEND_SMS_QPRODUCER.send(SEND_SMS_QUEUE, json.dumps(to_send))
        SEND_SMS_QPRODUCER.flush()
    except Exception,ex:
        print ex

