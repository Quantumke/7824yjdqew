var querystring = require('querystring');
var winston = require('winston');
var https = require('https');
var database = require('./database');

// Move to config
var username = 'cybercity';
var apikey   = 'be765227edc9e6ab0851c38954fe1f022999beb1ae0726c6c2458090f0e15fe7';

function sendMessage(isMT, keyword, message) {
	if (isMT) {
		var postData = querystring.stringify({
		    'username': username,
		    'to': message.mobileNumber,	   
		    'from': message.shortCode,
		    'keyword': message.keyword,
		    'message': message.text,
		    'bulkSMSMode': 0,
		    'retryDurationInHours': 12
		});
	} else {
		var postData = querystring.stringify({
		    'username': username,
		    'to': message.mobileNumber,	   
		    'from': message.shortCode,
		    'keyword': keyword,
		    'linkId': message.linkId,
		    'message': message.text,
		    'bulkSMSMode': 0
		});
	}
    
    var postOptions = {
		host: 'api.africastalking.com',
		port: '443',
		path: '/version1/messaging',
		method: 'POST',
		headers: {
		    'Content-Type' : 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length,
		    'Accept': 'application/json',
		    'apikey': apikey
		}
    };
    
	var request = https.request(postOptions, function(response) {
		response.setEncoding('utf8');	
		
	    response.on('data', function (data) {
			if (isJSON(data)) {
				var o = JSON.parse(data);
		    		var recipients = o.SMSMessageData.Recipients;

				if (recipients.length > 0) {
    				for (var i = 0; i < recipients.length; i++ ) {
    		 			winston.debug('Sent message ' + 
							'[number: ' + recipients[i].number + 
							', cost:, ' + recipients[i].cost + 
							', message_id: ' + recipients[i].messageId +
							', status: ' + recipients[i].status + ']', 
							{ 'function' : 'sendMessage', 'module' : 'sms' });

						database.saveMessage(recipients[i].messageId, isMT, keyword, message);
    		 		}	    		
    			} else {
    				winston.warn('Failed to send message', { 'function' : 'sendMessage', 'module' : 'sms' });
    			}
			} else {
				winston.warn('Cannot parse data [' + data + ']', { 'function' : 'sendMessage', 'module' : 'sms' });
			}	    		 
	    }); 
	});
    
	request.write(postData);
	request.end();
};

function isJSON(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	
	return true;
};

exports.sendMessage = sendMessage;