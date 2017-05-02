from __future__ import unicode_literals

from django.core.validators import MaxValueValidator, MinValueValidator

from django.db import models
from django.utils import timezone
import datetime
from django.utils.translation import ugettext_lazy as _


class Subscription(models.Model):
    id = models.AutoField(primary_key=True)
    mobile_number = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    sub_date = models.DateTimeField(default=timezone.now)
    unsub_date = models.DateTimeField(default=timezone.now)
    keyword = models.CharField(max_length=150)

    class Meta:
        db_table = u'subscription'
        verbose_name_plural = "subscription"
        unique_together = (("mobile_number", "keyword"),)
    def __unicode__(self):
        return u'%s' % (self.id)


class MessageOut(models.Model):
    id = models.AutoField(primary_key=True)
    mobile_number = models.CharField(max_length=150)
    status = models.CharField(max_length=15,default="-1")
    text = models.TextField()
    link_id = models.CharField(max_length=650,default="-1")
    message_id = models.CharField(max_length=160,default="-1")
    sub_date = models.DateTimeField(default=timezone.now)
    keyword = models.CharField(max_length=150,default="XX")
    reason = models.TextField()

    class Meta:
        db_table = u'messages_out'
        verbose_name_plural = "messages out"
    def __unicode__(self):
        return u'%s' % (self.id)

class MessageIn(models.Model):
    id = models.AutoField(primary_key=True)
    mobile_number = models.CharField(max_length=150)
    to = models.CharField(max_length=150)
    text = models.TextField()
    link_id = models.CharField(max_length=415,default="-1")
    message_id = models.CharField(max_length=460,default="-1")
    post_date = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = u'messages_in'
        verbose_name_plural = "messages in"
    def __unicode__(self):
        return u'%s' % (self.id)

class PredictionText(models.Model):
    id = models.AutoField(primary_key=True)
    send_date = models.DateField(_("Date"), default=datetime.date.today)
    text = models.CharField(max_length=320,unique=True)

    class Meta:
        db_table = u'prediction_text'
        verbose_name_plural = "prediction"
        unique_together = (("send_date", "text"),)

    def __unicode__(self):
        return u'%s' % (self.id)

#--------------------------------------------------------------------------------------
class Keyword(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=320,unique=True)

    class Meta:
        db_table = u'keyword'
        verbose_name_plural = "keyword"
    def __unicode__(self):
        return u'%s' % (self.text)

class SubscriptionText(models.Model):
    id = models.AutoField(primary_key=True)
    keyword = models.ForeignKey(Keyword)
    send_date = models.DateField(_("Date"), default=datetime.date.today)
    text = models.CharField(max_length=320)

    class Meta:
        db_table = u'subscription_text'
        verbose_name_plural = "subscription text"
        unique_together = (("keyword", "text","send_date"),)

    def __unicode__(self):
        return u'%s' % (self.id)



class OnDemandPredictionText(models.Model):
    G_CHOICES = {}
    for i in range(30):
        G_CHOICES[str(i+1)]=str(i+1)

    id = models.AutoField(primary_key=True)
    send_date = models.DateField(_("Date"), default=datetime.date.today)
    text = models.TextField(max_length=320,unique=True)
    game_id = models.IntegerField(default=1,validators=[MaxValueValidator(30), MinValueValidator(1)])

    class Meta:
        db_table = u'ondemand_prediction_text'
        verbose_name_plural = "On Demand Prediction Text"
        unique_together = (("send_date", "text","game_id"),)

    def __unicode__(self):
        return u'%s' % (self.id)
