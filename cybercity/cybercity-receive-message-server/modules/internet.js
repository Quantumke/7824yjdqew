var http = require('http');
var winston = require('winston');
var queue = require('./queue');

function sendData(message) {
	var regex = /^\+2547[0-2][0-9]\d{6}$/g;
	var network = regex.test(message.mobileNumber) ? 6392 : 6393;

	var url = 'http://54.194.24.192:8081/shmsms/receivemsgcybercity?username=cybercity&' +
		'linkid=' + message.linkId +
		'&mobile=' + encodeURIComponent(message.mobileNumber) +
		'&shortcode=' + message.shortCode +
		'&content=' + message.text +
		'&plmn=' + network;

	winston.info('Sending data [url: ' + url + ']', { 'function' : 'sendMessage', 'module' : 'internet' });

	http.get(url, function(response) {
		winston.info('Received status [code: ' + response.statusCode + ']', { 'function' : 'sendMessage', 'module' : 'internet' });
	}).on('error', function (error) {
		winston.error(error.message, { 'function' : 'sendMessage', 'module' : 'http' });
	});
}

exports.sendData = sendData;
