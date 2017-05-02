var winston = require('winston');
var mongoose = require('mongoose');
var internet = require('./internet');
var queue = require('./queue');

mongoose.connect('mongodb://localhost/cybertext');

// Short Code
var shortCodeSchema = new mongoose.Schema({
	text: String,
	is_active: Boolean
});

var ShortCode = mongoose.model('short_code', shortCodeSchema);

// Keyword
var keywordSchema = new mongoose.Schema({
	text: String,
	decription: String,
	is_active: Boolean,
	short_code_id: mongoose.Schema.Types.ObjectId
});

var Keyword = mongoose.model('keyword', keywordSchema);

// Subscription
var subscriptionSchema = new mongoose.Schema({
	mobile_number: String,
	is_active: Boolean,
	subscribe_date: { type: Date, default: Date.now },
	keyword_id: mongoose.Schema.Types.ObjectId
});

var Subscription = mongoose.model('subscription', subscriptionSchema);

function processSubscribeMessage(request, response) {
	// Retrieve POST data
	// Create an args object to avoid conflict with locals of the same names
	var args = {
		'phoneNumber' : request.body.phoneNumber,
		'shortCode' : request.body.shortCode,
		'keyword' : request.body.keyword,
		'updateType' : request.body.updateType
	};

	// 1. Select shortcode
	ShortCode.findOne({ 'text' : args.shortCode }, function(error, shortCode) {
		if(error) {
			winston.error(error.message, { 'function' : 'processSubscribeMessage', 'module' : 'database' });
			internet.sendResponse(response, 500, JSON.stringify({ error: 1, message: error.message }));
		} else {
			if(!shortCode) {
				message = 'Short code [' + args.shortCode + '] cannot be found';
				winston.warn(JSON.stringify(message), { 'function' : 'processSubscribeMessage', 'module' : 'database' });
				internet.sendResponse(response, 404, JSON.stringify({ error: 1, message: message }));
			} else {
				// 2. Select keyword
				Keyword.findOne({ 'text' : args.keyword, 'short_code_id' : shortCode._id }, function(error, keyword) {
					if(error) {
						winston.error(error.message, { 'function' : 'processSubscribeMessage', 'module' : 'database' });
						internet.sendResponse(response, 500, JSON.stringify({ error: 1, message: error.message }));
					} else {
						if(!keyword) {
							message = 'Keyword [' + args.keyword + '] cannot be found';
							winston.warn(JSON.stringify(message), { 'function' : 'processSubscribeMessage', 'module' : 'database' });
							internet.sendResponse(response, 404, JSON.stringify({ error: 1, message: message }));
						} else {
							queue.enqueueSubscribeMessage(request, response);
						}
					}
				});
			}
		}
	});
};

function processSendMessage(request, response) {
	// Retrieve POST data
	// Create an args object to avoid conflict with locals of the same names
	var args = {
		'mobileNumber' : request.body.mobile_number,
		'mtId' : request.body.mt_id,
		'linkId' : request.body.link_Id,
		'message' : request.body.message,
		'shortCode' : request.body.short_code,
		'keyword' : request.body.keyword
	};

	// 1. Find shortcode
	ShortCode.findOne({ 'text' : args.shortCode }, function(error, shortCode) {
		if(error) {
			winston.error(error.message, { 'function' : 'processSendMessage', 'module' : 'database' });
			internet.sendResponse(response, 500, JSON.stringify({ 'error' : 1, 'message' : error.message }));
		} else {
			if(!shortCode) {
				message = 'Short code [' + args.shortCode + '] cannot be found';
				winston.warn(message, { 'function' : 'processSendMessage', 'module' : 'database' });
				internet.sendResponse(response, 404, JSON.stringify({ 'error' : 1, 'message' : message }));
			} else {
				// 2. Select keyword
				Keyword.findOne({ 'text' : args.keyword, 'short_code_id' : shortCode._id }, function(error, keyword) {
					if(error) {
						winston.error(error.message, { 'function' : 'processSendMessage', 'module' : 'database' });
						internet.sendResponse(response, 500, JSON.stringify({ 'error' : 1, 'message' : error.message }));
					} else {
						if(!keyword) {
							message = 'Keyword [' + args.keyword + '] cannot be found';
							winston.warn(message, { 'function' : 'processSendMessage', 'module' : 'database' });
							internet.sendResponse(response, 400, JSON.stringify({ 'error' : 1, 'message' : message }));
						} else {
							// 3. Find susbcription
							Subscription.findOne({ 'mobile_number' : args.mobileNumber, 'keyword_id' : keyword._id }, function(error, subscription) {
								if(error) {
									winston.error(error.message, { 'function' : 'processSendMessage', 'module' : 'database' });
									internet.sendResponse(response, 500, JSON.stringify({ 'error' : 1, 'message' : error.message }));
								} else {
									// Check if susbcription exists
									if(!subscription) {
										message = 'Subscription [' + args.mobileNumber + '] cannot be found';
										winston.warn(message, { 'function' : 'processSendMessage', 'module' : 'database' });
										internet.sendResponse(response, 400, JSON.stringify({ 'error' : 1, 'message' : message }));
									} else {
										// Check if subscription is active
										if(!subscription.is_active) {
											message = 'Subscription [' + args.mobileNumber + '] is not active';
											winston.warn(message, { 'function' : 'processSendMessage', 'module' : 'database' });
											internet.sendResponse(response, 400, JSON.stringify({ 'error' : 1, 'message' : message }));
										} else {
											queue.enqueueSendMessage(request, response);
										}
									}
								}
							});
						}
					}
				});
			}
		}
	});
};

exports.processSubscribeMessage = processSubscribeMessage;
exports.processSendMessage = processSendMessage;