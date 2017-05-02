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
AT_USERNAME = "bet360"
AT_APIKEY   = "516f7e54a9349bb84e3e1877440a5f8a58d9bbb6cefa154ae5aa35bb65a955e8"
RETRY_DURATION_IN_HOURS = 12
AT_SHORTCODE = "22779"
AT_GATEWAY = AfricasTalkingGateway(AT_USERNAME, AT_APIKEY)

x={"P1":"Chelsea vs Everton - 1","P2":"Newcastle Utd vs Cardiff 1","P3":"Newcastle Utd vs Cardiff 1","P4":"Newcastle Utd vs Cardiff 1","P5":"Newcastle Utd vs Cardiff 1","P6":"Newcastle Utd vs Cardiff 1"}

for p in x:
    try:
        k = Keyword()
        k.text = p
        k.save()

        s = SubscriptionText()
        s.keyword = k
        s.send_date = datetime.datetime.today()
        s.text = x[p]
        s.save()
    except Exception,ex:
        print ex

