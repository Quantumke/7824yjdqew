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

from kafka import KafkaConsumer
from sms.models  import *
KAFKA_SERVERS = ['localhost:9092']
AT_USERNAME = "MyAfricasTalkingUsername"
AT_APIKEY   = "MyAfricasTalkingAPIKey"
RETRY_DURATION_IN_HOURS = 24
AT_SHORTCODE = "2220"
BULK_SMS_MODE = 0
QUEUE_NAME="delivery_report"

def update_delivery_status(message_id,status,reason):
    try:
        s = MessageOut.objects.get(message_id=message_id)
        s.status = status
        s.reason = reason
        s.save()
    except Exception,ex:
        print ex





print  "Delivery Report Queue Processor \nConnected to Kafka at "+str(KAFKA_SERVERS)+"\nWaiting...."
try:
    consumer = KafkaConsumer(QUEUE_NAME,bootstrap_servers=KAFKA_SERVERS)
    for message in consumer:
            try:
                info = json.loads(message.value)
                update_delivery_status(info['message_id'],info['status'],info['reason'])
            except Exception,ex:
                import traceback
                print ex
                traceback.print_exc()
except KafkaConfigurationError,ex:
    print ex
    print "kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic "+QUEUE_NAME
