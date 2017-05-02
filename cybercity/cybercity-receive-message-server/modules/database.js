var winston = require('winston');
var mongoose = require('mongoose');
var queue = require('./queue');
var internet = require('./internet');

mongoose.connect('mongodb://localhost/cybertext');

// ShortCode
var shortCodeSchema = new mongoose.Schema({
	text: String,
	is_active: Boolean,
	provider_id: mongoose.Schema.Types.ObjectId
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
		'mobileNumber': message.mobileNumber,
		'shortCode': message.shortCode,
		'text': message.text,
		'linkId': message.linkId,
		'date': message.date,
		'id': message.id
	};

	// Find short code
	ShortCode.findOne({ 'text' : args.shortCode }, function(error, shortCode) {
		if(error) {
			winston.error(err.message, { 'function' : 'processMessage', 'module' : 'database' });
		} else {
			if(!shortCode) {
				winston.warn('Cannot find short code [text: ' + args.shortCode + ']',
					{ 'function' : 'processMessage', 'module' : 'database' });
			} else {
				// Find keyword
				var text = getKeywordText(args.text);

				Keyword.findOne({ 'text' : text, 'short_code_id' : shortCode._id }, function(error, keyword) {
					if(error) {
						winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
					} else {
						if(!keyword) {
							winston.warn('Cannot find keyword [text: ' + args.text + ']',
								{ 'function' : 'processMessage', 'module' : 'database' });
						} else {
							// Save message
							var message = new Message();
							message.keyword_id = keyword._id;
							message.susbcription_id = null;
							message.text = args.text;
							message.message_type = 'MT';
							message.message_status = 'Success';
							message.link_id = args.link_id;

							message.save(function(error, message) {
								if (error) {
									winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
								} else {
									winston.info('Inserted message ' +
										'[id :' + message._id +
										', text: ' + args.text +
										', subscriber_id: ' + null +
										', keyword_id: ' + keyword._id +
										', message_type: MT' +
										', message_status: Success' +
										', link_id: ' + args.linkId + ']',
										{ 'function' : 'processMessage', 'module' : 'database' });

									internet.sendData(args);
								}
							});
						}
					}
				});
			}
		}
	});
};

function getKeywordText(text) {
	var regex = /^TTCN10/g;
	var isTTCN10 = regex.test(text);

	regex = /^TTCN20/g;
	var isTTCN20 = regex.test(text);

	regex = /^TTCN30/g;
	var isTTCN30 = regex.test(text);

	regex = /^TTCNTTAS10/g;
	var isTTCNTTAS10 = regex.test(text);

	regex = /^TTCNTTAS20/g;
	var isTTCNTTAS20 = regex.test(text);

	regex = /^TTCNTTAS30/g;
	var isTTCNTTAS30 = regex.test(text);

	regex = /^TTCNTTASM10/g;
	var isTTCNTTASM10 = regex.test(text);

	regex = /^TTCNTTASM20/g;
	var isTTCNTTASM20 = regex.test(text);

	regex = /^TTCNTTASM30/g;
	var isTTCNTTASM30 = regex.test(text);

	if (isTTCN10) {
		return 'TTCN10';
	} else if (isTTCN20) {
		return 'TTCN10';
	} else if (isTTCN30) {
		return 'TTCN10';
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
