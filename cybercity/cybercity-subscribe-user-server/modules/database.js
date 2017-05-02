var winston = require('winston');
var mongoose = require('mongoose');
var internet = require('./internet');

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
	'mobile_number' : String,
	'is_active' : Boolean,
	'subscribe_date' : { type: Date, default: Date.now },
	'keyword_id' : mongoose.Schema.Types.ObjectId
});

var Subscription = mongoose.model('subscription', subscriptionSchema);

function processMessage(message) {
	// Retrieve POST data
	// Create an args object to prevent conflict with locals with the same name
	var args = {
		'mobileNumber' : message.mobileNumber,
		'shortCode' : message.shortCode,
		'keyword' : message.keyword,
		'updateType' : message.updateType
	};

	// 1. Find shortcode
	ShortCode.findOne({ 'text' : args.shortCode }, function(error, shortCode) {
		if(error) {
			winston.error(error.message, { 'function' : 'processSendMessage', 'module' : 'database' });
		} else {
			if(!shortCode) {
				winston.warn('Short code [' + args.shortCode + '] cannot be found',
					{ 'function' : 'processSendMessage', 'module' : 'database' });
			} else {
				// Find keyword
				Keyword.findOne({ 'text': args.keyword, 'short_code_id': shortCode._id }, function(error, keyword){
					if(error) {
						winston.error(error.message, { 'function' : 'processUser', 'module' : 'database' });
					} else {
						if(!keyword) {
							winston.warn('Keyword [text: ' + args.keyword + '] cannot be found',
								{ 'function' : 'processUser', 'module' : 'database' });
						} else {
							// Find susbcription
							Subscription.findOne({ 'mobile_number': args.mobileNumber, 'keyword_id': keyword._id }, function(error, subscription) {
								if(error) {
									winston.error(error.message, { 'function' : 'processUser', 'module' : 'database' });
								} else {
									if (args.updateType == 'Addition') {
										if (!subscription) {
											// Create subscription
											var subscription = new Subscription();
											subscription.mobile_number = args.mobileNumber;
											subscription.is_active = true;
											subscription.keyword_id = keyword._id;

											subscription.save(function(error, susbcription) {
												if(error) {
													winston.error(error.message, { 'function' : 'processUser', 'module' : 'database' });
												} else {
													winston.info('Inserted subscription ' +
														'[mobile_no: ' + subscription.mobile_number +
														' ,is_active: ' + subscription.is_active + ']',
													{ 'function' : 'processUser', 'module' : 'database' });

													internet.sendData(args);
												}
											});
										} else {
											// Activate susbcription
											subscription.is_active = true;

											subscription.save(function(error, subscription) {
												if(error){
													winston.error(error.message, { 'function' : 'processUser', 'module' : 'database' });
												} else {
													winston.info('Updated subscription ' +
														'[mobile_no: ' + subscription.mobile_number +
														' ,is_active: ' + subscription.is_active + ']',
													{ 'function' : 'processUser', 'module' : 'database' });

													internet.sendData(args);
												}
											});
										}
									} else if (args.updateType == 'Deletion') {
										if (!subscription) {
											winston.warn('Cannot unsubscribe user ' +
												'[mobile_no: ' + args.mobileNumber + ']. Mobile number cannot be found',
												{ 'function' : 'processUser', 'module' : 'database' });
										} else {
											// Deactivate subscription
											subscription.is_active = false;

											subscription.save(function(error, subscription) {
												if(error){
													winston.error(error.message, { 'function' : 'processUser', 'module' : 'database' });
												} else {
													winston.info('Updated subscription ' +
														'[mobile_no: ' + subscription.mobile_number +
														' ,is_active: ' + subscription.is_active + ']',
													{ 'function' : 'processUser', 'module' : 'database' });

													internet.sendData(args);
												}
											});
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

exports.processMessage = processMessage;
