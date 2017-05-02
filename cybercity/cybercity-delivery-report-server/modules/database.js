var winston = require('winston');
var mongoose = require('mongoose');
var internet = require('./internet');
var queue = require('./queue');

mongoose.connect('mongodb://localhost/cybertext');

// Message
var messageSchema = new mongoose.Schema({
	text: String,
	atx_id: String,
	mt_id: String,
	link_id: String,
	message_type: String,
	message_status: String,
	sent_date: { type: Date, default: Date.now },
	keyword_id: mongoose.Schema.Types.ObjectId,
	subscription_id: mongoose.Schema.Types.ObjectId,
});

var Message = mongoose.model('message', messageSchema);

function processMessage(message) {
	// Create an args object to store locals that might have same name
	var args = {
		'atxId' : message.atxId,
		'status' : message.status
	};

	Message.findOneAndUpdate(
		{ 'atx_id': args.atxId },
		{ 'message_status': args.status },
		{ 'new' : true },
		function(error, message) {
			if(error){
				winston.error(error.message, { 'function' : 'processMessage', 'module' : 'database' });
			} else {
				if(!message) {
					var message =  'Message [atx_id: ' + args.atxId + '] cannot be found';
					winston.warn(message, { 'function' : 'processMessage', 'module' : 'database' });
				} else {
					winston.info('Updated message ' +
						'[id :' + message._id +
						', atx_id: ' + message.atx_id +
						', status: ' + message.message_status + ']',
						{ 'function' : 'processMessage', 'module' : 'database' });

					internet.sendReport(message);
				}
			}
		}
	);
};

exports.processMessage = processMessage;
