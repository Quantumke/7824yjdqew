var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cybertext');

function createProvider() {
	var providerSchema = new mongoose.Schema({
		text: String
	});

	var provider = mongoose.model('provider', providerSchema);

	console.log('Created provider schema');
};

function createShortCode() {
	var shortCodeSchema = new mongoose.Schema({
		text: String,
		is_active: Boolean,
		provider_id: mongoose.Schema.Types.ObjectId
	});

	var shortCode = mongoose.model('short_code', shortCodeSchema);

	console.log('Created short_code schema');
};

function createSubscription() {
	// Subscription
	var SubscriptionSchema = new mongoose.Schema({
		mobile_number: String,
		subscribe_date: { type: Date, default: Date.now },
		keyword_id: mongoose.Schema.Types.ObjectId,
		is_active: Boolean
	});

	var Subscription = mongoose.model('subscription', SubscriptionSchema);

	console.log('Created subscription schema');
};

function createKeyword() {
	var keywordSchema = new mongoose.Schema({
		text: String,
		short_code_id: Number,
		decription: String,
		is_active: Boolean
	});

	var keyword = mongoose.model('keyword', keywordSchema);

	console.log('Created keyword schema');
};

function createMessage() {
	var messageSchema = new mongoose.Schema({
		text: String,		
		message_type: String,
		message_status: String,
		subscription_id: mongoose.Schema.Types.ObjectId,
		sent_date: { type: Date, default: Date.now },
		atx_id: String,
		mt_id: String,
		link_id: String
	});

	var message = mongoose.model('message', messageSchema);

	console.log('Created message schema');
};

createProvider();
createShortCode();
createSubscriber();
createKeyword();
createMessage();
