var http = require('http');
var winston = require('winston');
var uuid = require('node-uuid');
var queue = require('./queue');

function sendData(args) {
	// Generate linkId
	var linkId = uuid.v4().replace(/-/g, '');

	// Detect mobile network
	var regex = /^\+2547[0-2][0-9]\d{6}$/g;
	var plmn = regex.test(args.mobileNumber) ? 6392 : 6393;

	if (args.updateType == 'Deletion') {
		// Stop keyword is keyword minus the first 4 characters i.e. TTCN
		args.keyword = args.keyword.slice(4);
	}

	var url = 'http://54.194.24.192:8081/shmsms/receivemsgcybercity?username=cybercity' + 
		'&mobile=' + encodeURIComponent(args.mobileNumber) + 
		'&shortcode=' + args.shortCode + 
		'&content=' + args.keyword + 
		'&linkid=' + linkId + 
		'&plmn=' + plmn;

	winston.info('Sending data [url: ' + url + ']', { 'function' : 'sendData', 'module' : 'internet' });

	http.get(url, function(response) {
		winston.info('Received status [code: ' + response.statusCode + ']', { 'function' : 'sendData', 'module' : 'internet' });
	}).on('error', function (error) {
		winston.error(error.message, { 'function' : 'sendData', 'module' : 'internet' });
	});
};

exports.sendData = sendData;