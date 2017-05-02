
from django.conf.urls import (handler400, handler403, handler404, handler500)
from django.contrib import admin
from sms import views
from django.conf.urls import include, url
from sms.admin import admin_site

from django.conf.urls import url
from django.contrib import admin

urlpatterns = [
    url(r'^xtransfer_admin_px2121/', admin_site.urls),
    url(r'^prediction/subscription', views.prediction_subscription),
    url(r'^prediction/active/subscribe/user', views.active_prediction_subscribe_user), #doing an active subscription
    url(r'^receive/delivery/report', views.receive_delivery_report),
    url(r'^message/receive', views.message_receive), #for on demand
]
