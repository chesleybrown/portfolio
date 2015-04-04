'use strict';

var settings = {
	port: 3000,
	logger: process.env.APP_LOGGER ? JSON.parse(process.env.APP_LOGGER) : false,
	session: {
		secret: process.env.APP_SESSION_SECRET
	},
	evernote: {
		consumerKey: process.env.APP_EVERNOTE_CONSUMER_KEY,
		consumerSecret: process.env.APP_EVERNOTE_CONSUMER_SECRET,
		callbackURL: process.env.APP_EVERNOTE_CALLBACK_URL,
		blogNotebookGuid: process.env.APP_EVERNOTE_BLOG_NOTEBOOK_GUID,
		publishedTagGuid: process.env.APP_EVERNOTE_BLOG_PUBLISHED_TAG_GUID,
		token: process.env.APP_EVERNOTE_TOKEN,
		sandbox: process.env.APP_EVERNOTE_SANDBOX ? JSON.parse(process.env.APP_EVERNOTE_SANDBOX) : false
	},
	mongo: {
		db: process.env.APP_DB_NAME,
		host: process.env.DB_PORT_27017_TCP_ADDR,
		port: process.env.DB_PORT_27017_TCP_PORT ? process.env.DB_PORT_27017_TCP_PORT : 27017
	},
	twitter: {
		screenName: process.env.APP_TWITTER_SCREEN_NAME,
		consumerKey: process.env.APP_TWITTER_CONSUMER_KEY,
		consumerSecret: process.env.APP_TWITTER_CONSUMER_SECRET,
		accessToken: process.env.APP_TWITTER_ACCESS_TOKEN,
		accessTokenSecret: process.env.APP_TWITTER_ACCESS_TOKEN_SECRET
	},
	facebook: {
		username: process.env.APP_FACEBOOK_USERNAME,
		appId: process.env.APP_FACEBOOK_APP_ID,
		secret: process.env.APP_FACEBOOK_SECRET
	}
};

module.exports = settings;
