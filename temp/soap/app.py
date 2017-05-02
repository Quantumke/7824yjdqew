#!/usr/bin/python
# -*- coding:utf-8 -*-

from lxml import etree
import os,datetime,traceback,sys,urllib2,uuid,re,json
from decimal import Decimal
import ssl,urllib,urllib2,json,re,httplib,socket


AIRTEL_USERNAME="9111627"
AIRTEL_PASSWORD="xYber@2o15CT"
AIRTEL_HOST_URL='https://41.223.56.58:44433/MerchantQueryService.asmx?wsdl'

time_now = datetime.datetime.now()
time_past = time_now - datetime.timedelta(hours=20)
query_time_to  = time_now.strftime("%Y%m%d%H%M%S")
query_time_from = time_past.strftime("%Y%m%d%H%M%S")

def connect(self):
    "Connect to a host on a given (SSL) port."
    sock = socket.create_connection((self.host, self.port),
                                        self.timeout, self.source_address)
    if self._tunnel_host:
        self.sock = sock
        self._tunnel()
    self.sock = ssl.wrap_socket(sock, self.key_file,
                                self.cert_file,
                                ssl_version=ssl.PROTOCOL_TLSv1)

#httplib.HTTPSConnection.connect = connect

def http_post(url,params):
    try:
        req = urllib2.Request(url, params,headers={"Content-Type":"text/xml; charset=\"utf-8\""})
        response = urllib2.urlopen(req)
        r = response.read()
        print r,">>\n"
        return r
    except Exception,ex:
        print ex,"XX"
        print ex.message
        traceback.print_exc()
        return """<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><RequestTransactionByTimeIntervalDetailedResponse xmlns="http://www.airtel.com/"><RequestTransactionByTimeIntervalDetailedResult><Message>"""+str(ex)+"""</Message><Status>0</Status><TotalAmount>0</TotalAmount><TotalTransactions>0</TotalTransactions><Transactions /></RequestTransactionByTimeIntervalDetailedResult></RequestTransactionByTimeIntervalDetailedResponse></soap:Body></soap:Envelope>"""



XML="""<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:ns0="http://www.airtel.com/" xmlns:ns1="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Header/><ns1:Body><ns0:RequestTransactionByTimeIntervalDetailed><ns0:userName>9111627</ns0:userName><ns0:passWord>xYber@2o15CT</ns0:passWord><ns0:timeFrom>"""+query_time_from+"""</ns0:timeFrom><ns0:timeTo>"""+query_time_to+"""</ns0:timeTo></ns0:RequestTransactionByTimeIntervalDetailed></ns1:Body></SOAP-ENV:Envelope>"""

xml = http_post(AIRTEL_HOST_URL,XML)


root = etree.fromstring(xml)
NS={"ns":"http://www.airtel.com/","soap":"http://schemas.xmlsoap.org/soap/envelope/"," ":"http://www.airtel.com/"}




transactions = root.findall(".//{http://www.airtel.com/}Transactions")[0].text
total_transactions = root.findall(".//{http://www.airtel.com/}TotalTransactions")[0].text
total_amount = root.findall(".//{http://www.airtel.com/}TotalAmount")[0].text
status = root.findall(".//{http://www.airtel.com/}Status")[0].text

print transactions

if status == "0":
    for trans in transactions.split(","):
        print trans
        try:
            record = trans.encode("utf-8").split("£")
            reference_id = record[0][1:]
            msisdn = record[1]
            amount = record[2]
            charges = record[3]
            reference_field = record[4]
            timestamp = record[5]
            first_name = record[6]
            last_name = record[7][:-1]

            print str(reference_id)+" "+str(msisdn)+" "+str(amount)+" "+str(charges)+" "+str(reference_field)+" "+str(timestamp)+" "+str(first_name)+" "+str(last_name)
            data = {'reference_id':reference_id,'msisdn':msisdn,'amount':amount,'charges':charges,'reference_field':reference_field,'timestamp':timestamp,'sender_name':first_name+" "+last_name,'service_type_id':service_type_id,'service_type_name':'KE-AIRTEL-MOBILEMONEY','country_code':country_code,"currency_id":currency_id,"country_id":country_id}
        except Exception,ex:
            logging.error(ex,exc_info=True)
