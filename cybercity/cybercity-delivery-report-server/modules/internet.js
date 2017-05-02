var http = require('http');
var winston = require('winston');

global.control = 0;

var status = {
	'Sent' : 1,
	'Submitted' : 2,
	'Buffered' : 3,
	'Rejected' : 4,
	'Success' : 5,
	'Failed' : 6
};

function sendReport(message) {
	// Convert status to a digit
	var url = 'http://54.194.24.192:8081/shmsms/deliveryreport?username=cybercity&dlr=' + status[message.message_status] + '&mtid=' + message.mt_id;
	winston.info('Sending data [url: ' + url + ']', { 'function' : 'sendReport', 'module' : 'http' });	

	http.get(url, function(response) {
		winston.info('Received status [code: ' + response.statusCode + ']', { 'function' : 'sendReport', 'module' : 'http' });
	}).on('error', function (error) {
		winston.error(error.message, { 'function' : 'sendReport', 'module' : 'http' });
	});
};

exports.sendReport = sendReport;