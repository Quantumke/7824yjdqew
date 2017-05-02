var winston = require('winston');
var mongoose = require('mongoose');
var sms = require('./sms');
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

// Message
var messageSchema = new mongoose.Schema({
	text: String,
	message_type: String,
	message_status: String,
	atx_id: String,
	mt_id: String,
	link_id: String,
	sent_date: { type: Date, default: Date.now },
	keyword_id: mongoose.Schema.Types.ObjectId,
	subscription_id: mongoose.Schema.Types.ObjectId
});

var Message = mongoose.model('message', messageSchema);

function processMessage(message) {
	var args = {
		'isMT' : true,
		'keyword' : message.keyword,
		'shortCode' : message.shortCode,
		'mobileNumber' : message.mobileNumber
	};

	args.keyword = getKeyword(message.keyword);
	if(args.keyword) {
		args.isMT = false;
	} else {
		args.keyword = message.keyword;
	}

	// 1. Find shortcode
	ShortCode.findOne({ 'text' : args.shortCode }, function(error, shortCode) {
		if(error) {
			winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
		} else {
			if(!shortCode) {
				winston.warn('Short code [' + args.shortCode + '] cannot be found',
					{ 'function' : 'processMessage', 'module' : 'database' });
			} else {
				// 2. Find keyword
				Keyword.findOne({ 'text' : args.keyword, 'short_code_id' : shortCode._id }, function(error, keyword) {
					if(error) {
						winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
					} else {
						if(!keyword) {
							winston.warn('Keyword [' + args.keyword + '] cannot be found',
								{ 'function' : 'processMessage', 'module' : 'database' });
						} else {
							// 3. Find susbcription
							Subscription.findOne({ 'mobile_number' : args.mobileNumber, 'keyword_id' : keyword._id }, function(error, subscription) {
								if(error) {
									winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
								} else {
									// Check if susbcription exists
									if(!subscription) {
										message = 'Subscription [mobile_number: ' + args.mobileNumber + ', keyword: ' + keyword.text + '] cannot be found';
										winston.warn(message, { 'function' : 'processMessage', 'module' : 'database' });
									} else {
										// Check if subscription is active
										if(!subscription.is_active) {
											message = 'Subscription [' + args.mobileNumber + '] is not active';
											winston.warn(message, { 'function' : 'processMessage', 'module' : 'database' });
										} else {
											sms.sendMessage(args.isMT, args.keyword, message);
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

function saveMessage(atxId, isMT, keyword, message) {
	// Create new args object to avoid conflicts with locals of the same name
	var args = {
		'atxId' : atxId,
		'isMT' : isMT,
		'keyword' : keyword,
		'mobileNumber' : message.mobileNumber,
		'mtId' : message.mtId,
		'linkId' : message.linkId,
		'text' : message.text
	};

	// Find keyword
	Keyword.findOne({ 'text' : args.keyword }, function(error, keyword) {
		if(error) {
			winston.error(error.message, { 'function' : 'saveMessage', 'module' : 'database' });
		} else {
			if(!keyword) {
				winston.warn('Cannot find keyword [text: ' + args.keyword + ']',
					{ 'function' : 'saveMessage', 'module' : 'database' });
			} else {
				// Find susbcription
				Subscription.findOne({ 'mobile_number': args.mobileNumber, 'keyword_id' : keyword._id }, function(error, subscription) {
					if(error) {
						winston.error(error.message, { 'function' : 'saveMessage', 'module' : 'database' });
					} else {
						if(!subscription) {
							winston.warn('Cannot find subscription [mobile_number: ' + args.mobileNumber + ']',
								{ 'function' : 'saveMessage', 'module' : 'database' });
						} else {
							// Save message
							Message.create({
								'atx_id': args.atxId,
								'mt_id' : args.mtId,
								'link_id' : args.linkId,
								'text' : args.text,
								'message_type' : (args.isMT ? 'MT' : 'MO'),
								'message_status' : 'Sent',
								'keyword_id' : null,
								'subscription_id' : subscription._id
							}, function(error, message){
								if(error) {
									winston.error(error.message, { 'function' : 'saveMessage', 'module' : 'database' });
								} else {
									winston.info('Inserted message ' +
										'[id :' + message._id +
										', text : ' + message.text +
										', message_type : ' + message.message_type +
										', message_status : ' + message.message_status +
										', atx_id : ' + message.atx_id +
										', mt_id : ' + message.mt_id +
										', link_id : ' + message.link_id +
										', sent_date : ' + message.sent_date +
										', keyword_id : ' + message.keyword_id +
										', subscription_id : ' + message.subscription_id + ']',
										{ 'function' : 'saveMessage', 'module' : 'database' });
								}
							});
						}
					}
				});
			}
		}
	});
};

function getKeyword(keyword) {
	var regex = /^TTCN10/i;
	var isTTCN10 = regex.test(keyword);

	regex = /^TTCN20/i;
	var isTTCN20 = regex.test(keyword);

	regex = /^TTCN30/i;
	var isTTCN30 = regex.test(keyword);

	regex = /^TTCNTTAS10/i;
	var isTTCNTTAS10 = regex.test(keyword);

	regex = /^TTCNTTAS20/i;
	var isTTCNTTAS20 = regex.test(keyword);

	regex = /^TTCNTTAS30/i;
	var isTTCNTTAS30 = regex.test(keyword);

	regex = /^TTCNTTASM10/i;
	var isTTCNTTASM10 = regex.test(keyword);

	regex = /^TTCNTTASM20/i;
	var isTTCNTTASM20 = regex.test(keyword);

	regex = /^TTCNTTASM30/i;
	var isTTCNTTASM30 = regex.test(keyword);

	if (isTTCN10) {
		return 'TTCN10';
	} else if (isTTCN20) {
		return 'TTCN20';
	} else if (isTTCN30) {
		return 'TTCN30';
	} else if (isTTCNTTAS10) {
		return 'TTCNTTAS10';
	} else if (isTTCNTTAS20) {
		return 'TTCNTTAS20';
	} else if (isTTCNTTAS30) {
		return 'TTCNTTAS30';
	} else if (isTTCNTTASM10) {
		return 'TTCNTTASM10';
	} else if (isTTCNTTASM20) {
		return 'TTCNTTASM20';
	} else if (isTTCNTTASM30) {
		return 'TTCNTTASM30';
	} else {
		return '';
	}
};

exports.processMessage = processMessage;
exports.saveMessage = saveMessage;
