var winston = require('winston');
var redis = require('redis');
var database = require('./database');

var client = redis.createClient();

function receiveMessage() {
	client.rpop('send-message', function(error, key) {
		if(error) {
			winston.error(error.message, { 'function' : 'receiveMessage', 'module' : 'queue' });
		} else {
			if(key) {
				client.get(key, function(error, message){
					if(error) {
						winston.error(error.message, { 'function' : 'receiveMessage', 'module' : 'queue' });
					} else {
						// Avoid instances where key is present in the list but can't be retrieved			
						if (message) {
							database.processMessage(JSON.parse(message));
						}
					}
				});
			}
		}
	});
};

exports.receiveMessage = receiveMessage;
