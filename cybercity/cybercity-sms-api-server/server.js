var http = require('http');
var director = require('director');
var winston = require('winston');
var internet = require('./modules/internet');
var database = require('./modules/database');
var queue = require('./modules/queue');

var fileOptions = {
	level: 'debug',
	filename: './logs/server.log'
};

winston.remove(winston.transports.Console);
winston.add(winston.transports.File, fileOptions);

winston.info('Creating router...', 
	{ 'module' : 'service', 'function' : 'global' });

var router = new director.http.Router({
	'/v1.0/user/subscribe' : {
		post: function () {
			// database.processSubscribeMessage(this.req, this.res);
			queue.enqueueSubscribeUser(this.req, this.res);
		}
	},
	'/v1.0/message/send' : {
		post: function () {
			// database.processSendMessage(this.req, this.res);
			queue.enqueueSendMessage(this.req, this.res);
		}
	},
	'/v1.0/message/receive' : {
		post: function () {
			queue.enqueueReceiveMessage(this.req, this.res);
		}
	},
	'/v1.0/report/deliver' : {
		post: function () {
			queue.enqueueDeliverReport(this.req, this.res);
		}
	}
});

winston.info('Created router with routes [/user/subscribe/v1.0, /message/send/v1.0, /message/receive/v1.0, /report/deliver/v1.0]', 
	{ 'module' : 'service', 'function' : 'global' });


winston.info('Creating server...', 
	{ 'module' : 'service', 'function' : 'global' });

var server = http.createServer(function (request, response) {
	request.chunks = [];
  	request.on('data', function (chunk) {
    	request.chunks.push(chunk.toString());
  	} );

	router.dispatch(request, response, function (error) {
		if (error) {		
			winston.error(error.message, { 'module' : 'server', 'function' : 'router.dispatch' });
			internet.sendResponse(response, 500, JSON.stringify({ error: 1, message: error.message }));
		}
	});
});

winston.info('Created server', 
	{ 'module' : 'service', 'function' : 'global' });


winston.info('Starting server...', 
	{ 'module' : 'service', 'function' : 'global' });

server.listen(8000);

winston.info('Started server listening on port 8000', 
	{ 'module' : 'service', 'function' : 'global' });