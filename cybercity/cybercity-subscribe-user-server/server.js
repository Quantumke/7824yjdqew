var winston = require('winston');
var queue = require('./modules/queue');

var fileOptions = {
	level: 'debug',
	filename: './logs/server.log'
};

winston.remove(winston.transports.Console);
winston.add(winston.transports.File, fileOptions);

setInterval(function() {
	queue.receiveMessage();
}, 1000);

winston.info('Started server', { 'function': 'global', 'module': 'service' });