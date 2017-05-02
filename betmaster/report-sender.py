#!/usr/bin/python
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
GMAIL_USER="saibatestapi@gmail.com"
GMAIL_PASS="saibatestapi123"


def send_gmail_email(recipient, subject, body):
    import smtplib

    gmail_user = GMAIL_USER
    gmail_pwd = GMAIL_PASS
    FROM = GMAIL_USER
    TO = recipient if type(recipient) is list else [recipient]
    SUBJECT = subject
    TEXT = body

    # Prepare actual message
    message = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (FROM, ", ".join(TO), SUBJECT, TEXT)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(gmail_user, gmail_pwd)
        server.sendmail(FROM, TO, message)
        server.close()
        print 'successfully sent the mail'
    except Exception,ex:
        print ex
        print "failed to send mail"

count = len(Subscription.objects.filter(is_active=True))
print count

mail_count = len(MessageOut.objects.all())
print mail_count

if int(mail_count) % 100 == 0:
    send_gmail_email("yonnym@gmail.com", "Betmaster Stats - M "+str(mail_count)+" = S "+str(count), count)

