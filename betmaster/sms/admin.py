from django.contrib import admin


# Register your models here.


from sms import models as public_api_models
from sms.models import *
from django.contrib import admin
from django.db.models.base import ModelBase
import inspect
from django.contrib.admin import AdminSite


admin.site.disable_action('delete_selected')

# Very hacky!

for name, var in public_api_models.__dict__.items():
    try:
        for x in inspect.getmembers(var, lambda a:not(inspect.isroutine(a))):
            if x[0] == "__dict__":
                if x[1]['__doc__'] is None:
                    continue
                xv = x[1]['__doc__'].replace("(",",").replace(")","").split(",")
                clsp = xv[0]
                pstr = ""
                dpp = []
                for p in xv[1:]:
                    dpp.append(p.strip()+"=self."+p.strip())
                    pstr += ",'"+p.strip()+"'"
                #print "dict("+",".join(dpp)+")"
                print "class "+clsp+"Admin(admin.ModelAdmin):"
                print "\t\tlist_display = ("+pstr[1:]+")"
                print "\t\tsearch_fields = ("+pstr[1:]+")"
                print "\t\tlist_filter = ("+pstr[1:]+")"
                #print "\t\tdef has_delete_permission(self, request, obj=None):"
                #print "\t\t\treturn False"
                #print "\t\tdef has_add_permission(self, request):"
                #print "\t\t\treturn False"
                print "admin_site.register("+clsp+", "+clsp+"Admin)"
    except Exception,ex:
        pass
    #if type(var) is ModelBase:
    #    admin_site.register(var)

class MyAdminSite(AdminSite):
    site_header = 'Dashboard'
admin_site = MyAdminSite(name='myadmin')
admin_site.disable_action('delete_selected')


class MessageInAdmin(admin.ModelAdmin):
		list_display = ('id','mobile_number','to','text','link_id','message_id','post_date')
		search_fields = ('id','mobile_number','to','text','link_id','message_id','post_date')
		list_filter = ('id','mobile_number','to','text','link_id','message_id','post_date')
admin_site.register(MessageIn, MessageInAdmin)
class PredictionTextAdmin(admin.ModelAdmin):
		list_display = ('id','send_date','text')
		search_fields = ('id','send_date','text')
		list_filter = ('id','send_date','text')
admin_site.register(PredictionText, PredictionTextAdmin)
class MessageOutAdmin(admin.ModelAdmin):
		list_display = ('id','mobile_number','status','text','link_id','message_id','sub_date','keyword','reason')
		search_fields = ('id','mobile_number','status','text','link_id','message_id','sub_date','keyword','reason')
		list_filter = ('id','mobile_number','status','text','link_id','message_id','sub_date','keyword','reason')
admin_site.register(MessageOut, MessageOutAdmin)
class SubscriptionAdmin(admin.ModelAdmin):
		list_display = ('id','mobile_number','is_active','sub_date','unsub_date','keyword')
		search_fields = ('id','mobile_number','is_active','sub_date','unsub_date','keyword')
		list_filter = ('id','mobile_number','is_active','sub_date','unsub_date','keyword')
admin_site.register(Subscription, SubscriptionAdmin)


class KeywordAdmin(admin.ModelAdmin):
		list_display = ('id','text')
		search_fields = ('id','text')
		list_filter = ('id','text')
admin_site.register(Keyword, KeywordAdmin)
class SubscriptionTextAdmin(admin.ModelAdmin):
		list_display = ('id','keyword','send_date','text')
		search_fields = ('id','send_date','text')
		list_filter = ('id','keyword','send_date','text')
admin_site.register(SubscriptionText, SubscriptionTextAdmin)



class OnDemandPredictionTextAdmin(admin.ModelAdmin):
		list_display = ('id','send_date','text','game_id')
		search_fields = ('id','send_date','text','game_id')
		list_filter = ('id','send_date','text','game_id')
admin_site.register(OnDemandPredictionText, OnDemandPredictionTextAdmin)

