'use strict';

var settings = {
	port: process.env.PORT,
	logger: process.env.APP_LOGGER ? JSON.parse(process.env.APP_LOGGER) : false,
};

module.exports = settings;
