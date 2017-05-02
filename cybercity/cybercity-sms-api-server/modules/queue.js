var redis = require('redis');
var winston = require('winston');
var uuid = require('node-uuid');
var internet = require('./internet');

var client = redis.createClient();

function enqueueSubscribeUser(request, response) {
	var key = uuid.v4().replace(/-/g, '');
	
	var mobileNumber = '';
	if (request.body.phoneNumber.substr(0, 1) !== '+') {
    		mobileNumber = '+' + request.body.phoneNumber;
	} else {
		mobileNumber = request.body.phoneNumber;
	}

	var message = {
		'mobileNumber': mobileNumber,
		'shortCode': request.body.shortCode,
		'keyword': request.body.keyword,
		'updateType': request.body.updateType
	};

	client.lpush(['subscribe-user' , key], function(error, data){
		// data = number of items on the list
		if(error) {			
			winston.error(error.message, { 'function' : 'enqueueSubscribeMessage', 'module' : 'queue' });
		} else {
			client.set([key, JSON.stringify(message)], function(err, data){
				// data = true
				if(error) {
					winston.error(error.message, { 'function' : 'enqueueSubscribeMessage', 'module' : 'queue' });
				} else {
					client.expire(key, 86400, function(err, data) {
						if(error) {
							winston.error(error.message, { 'function' : 'enqueueSubscribeMessage', 'module' : 'queue' });
						} else {
							// data = 0 if key already exists
							message = 'Enqueued message ' + 
								'[mobile_number: ' + request.body.phoneNumber + 
								', short_code: ' + request.body.shortCode + 
								', keyword: ' + request.body.keyword + 
								', update_type: ' + request.body.updateType + ']';
							winston.info(message, { 'function' : 'enqueueSubscribeMessage', 'module' : 'queue' });
							internet.sendResponse(response, 200, message);
						}
					});
				}
			});
		}
	});
};

function enqueueSendMessage(request, response){
	var key = uuid.v4().replace(/-/g, '');
	
	var mobileNumber = '';
	if (request.body.mobile_number.substr(0, 1) !== '+') {
    		mobileNumber = '+' + request.body.mobile_number;
	} else {
		mobileNumber = request.body.mobile_number;
	}
	
	var message = {
		'mobileNumber': mobileNumber,
		'mtId': request.body.mt_id,
		'linkId': request.body.link_id,
		'shortCode': request.body.short_code,
		'keyword': request.body.keyword,		
		'text': request.body.message
	};

	client.lpush(['send-message' , key], function(error, data){
		// data = number of items on the list
		if(error) {			
			winston.error(error.message, { 'function' : 'enqueueSendMessage', 'module' : 'queue' });
		} else {
			client.set([key, JSON.stringify(message)], function(error, data){
				// data = true
				if(error) {
					winston.error(error.message, { 'function' : 'enqueueSendMessage', 'module' : 'queue' });
				} else {
					client.expire(key, 86400, function(err, data) {
						if(error) {
							winston.error(error.message, { 'function' : 'enqueueSendMessage', 'module' : 'queue' });
						} else {
							// data = 0 if key already exists
							message = 'Enqueued message ' + 
								'[mobile_number: ' + request.body.mobile_number + 
								', short_code: ' + request.body.short_code + 
								', keyword: ' + request.body.keyword + 
								', mt_id: ' + request.body.mt_id + 
								', link_id: ' + request.body.link_id + 
								', message: ' + request.body.message + ']';

							winston.info(message, { 'function' : 'enqueueSendMessage', 'module' : 'queue' });
							internet.sendResponse(response, 200, message);
						}
					});
				}
			});
		}
	});	
};

function enqueueReceiveMessage(request, response){
	var key = uuid.v4().replace(/-/g, '');
	
	var mobileNumber = '';
	if (request.body.from.substr(0, 1) !== '+') {
    		mobileNumber = '+' + request.body.from;
	} else {
		mobileNumber = request.body.from;
	}
	
	var message = {
		'mobileNumber': mobileNumber,	
		'shortCode': request.body.to,
		'text': request.body.text,
		'linkId': request.body.linkId,
		'date': request.body.date,
		'id': request.body.id	
		
	};

	client.lpush(['receive-message' , key], function(error, data){
		// data = number of items on the list
		if(error) {			
			winston.error(error.message, { 'function' : 'enqueueReceiveMessage', 'module' : 'queue' });
		} else {
			client.set([key, JSON.stringify(message)], function(error, data){
				// data = true
				if(error) {
					winston.error(error.message, { 'function' : 'enqueueReceiveMessage', 'module' : 'queue' });
				} else {
					client.expire(key, 86400, function(error, data) {
						if(error) {
							winston.error(error.message, { 'function' : 'enqueueReceiveMessage', 'module' : 'queue' });
						} else {
							// data = 0 if key already exists
							message = 'Enqueued message ' + 
								'[mobile_number: ' + request.body.from + 
								', short_code: ' + request.body.to + 
								', text: ' + request.body.text + 			
								', link_id: ' + request.body.linkId + 
								', date: ' + request.body.date +
								', id: ' + request.body.id + ']';

							winston.info(message, { 'function' : 'enqueueReceiveMessage', 'module' : 'queue' });
							internet.sendResponse(response, 200, message);
						}
					});
				}
			});
		}
	});
};

function enqueueDeliverReport(request, response) {
	var key = uuid.v4().replace(/-/g, '');
	var message = {
		'atxId': request.body.id,
		'status': request.body.status
	};

	client.lpush(['deliver-report' , key], function(error, data){
		// data = number of items on the list
		if(error) {			
			winston.error(error.message, { 'function' : 'enqueueDeliverReport', 'module' : 'queue' });
		} else {
			client.set([key, JSON.stringify(message)], function(error, data){
				// data = true
				if(error) {
					winston.error(error.message, { 'function' : 'enqueueDeliverReport', 'module' : 'queue' });
				} else {
					client.expire(key, 86400, function(error, data) {
						if(error) {
							winston.error(error.message, { 'function' : 'enqueueDeliverReport', 'module' : 'queue' });
						} else {
							// data = 0 if key already exists
							message = 'Enqueued message ' + 
								'[atx_id: ' + request.body.id + 	
								', status: ' + request.body.status + ']';
							winston.info(message, { 'function' : 'enqueueDeliverReport', 'module' : 'queue' });
							internet.sendResponse(response, 200, message);
						}
					});
				}
			});
		}
	});
};

exports.enqueueSubscribeUser = enqueueSubscribeUser;
exports.enqueueSendMessage = enqueueSendMessage;
exports.enqueueReceiveMessage = enqueueReceiveMessage;
exports.enqueueDeliverReport = enqueueDeliverReport;
