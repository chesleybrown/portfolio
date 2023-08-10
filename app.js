'use strict';

var settings = require('./settings.js');
var express = require('express');
var app = express();
var favicon = require('serve-favicon');

// Log
if (settings.logger) {
	app.use(express.logger());
}

// Render static html files
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/web'));

app.use(favicon(__dirname + '/web/favicon.ico'));

// 404, not found
app.get('*', function (req, res) {
	res.render(__dirname + '/web/404.html');
});

app.use(function (err, req, res, next) {
	if (!err) {
		next();
		return;
	}
	
	console.error(err);
	res.status(500);
	res.send('Sorry... error!');
});

// Start server
app.listen(settings.port);
console.log('Listening on port ' + settings.port);
