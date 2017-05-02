function sendResponse(response, statusCode, message) {
	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(message, 'utf8')
	};

	response.writeHead(statusCode, headers);
	response.end(message);
};

exports.sendResponse = sendResponse;