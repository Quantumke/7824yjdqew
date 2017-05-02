#!/usr/bin/python
from lxml import etree,html
from io import StringIO, BytesIO
import urllib2,urllib,time
from cookielib import CookieJar
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import BaseHTTPServer
import urlparse,cgi,cookielib,urllib2,re,urllib,time, datetime,os,django
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from django.utils import timezone
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "betmaster.settings")
django.setup()
from sms.models  import *





from lxml import etree
import traceback

htmlparser = etree.HTMLParser()



def http_get(url):
    opener = urllib2.build_opener()
    opener.addheaders = [('User-Agent', 'Apache-HttpClient/UNAVAILABLE (java 1.4)'),('Connection','Keep-Alive'),('Content-Type','application/json;charset=UTF-8')]
    response = opener.open(url)
    return response.read()



x = http_get("http://adibet.com/")

tree = etree.fromstring(x,htmlparser)

elems = []

def insert_prediction(text):
    try:
        s = PredictionText()
        s.text = text
        s.save()
    except Exception,ex:
        print ex


def get_elems(tree_):
    if len(tree_.getchildren()) != 0:
        elems.extend(tree_.findall(".//tr"))

for tr in tree.xpath("//table"):
    get_elems(tr)
print len(elems)

for tr in elems:
    try:
        tds = tr.findall("td")
        odds = []
        teams  = []
        for xp in tds:
            try:
                if xp.find("font") is not None:
                    if xp.find("font").attrib.get('color','') == "#D5B438":
                        if xp.attrib.get("bgcolor","") == "#272727":
                            odds.append(xp.find("font").text)
                        else:
                            teams.append(xp.find("font").text.replace("\n","").replace("\t",""))

        #team1,team2 =  tds[1].text.split(" - ")
        #print team1,team2,odds
            except Exception,ex:
                pass
        if len(odds) != 0:
            print teams[0],",".join(odds)
            insert_prediction(teams[0]+" - "+",".join(odds))
    except Exception,ex:
        pass

