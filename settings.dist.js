/*
 * Copy me into settings.js and update accordingly
 */

var config = {
	port: 3000,
	logger: false,
	session: {
		secret: 'RANDOM_SECRET_HERE'
	},
	evernote: {
		consumerKey: 'EVERNOTE_CONSUMER_KEY_HERE',
		consumerSecret: 'EVERNOTE_CONSUMER_SECRET_HERE',
		callbackURL: 'EVERNOTE_CALLBACK_URL_HERE',
		notebookGuid: 'EVERNOTE_BLOG_NOTEBOOK_GUID_HERE',
		tagGuid: 'EVERNOTE_PLUBLISHED_TAG_GUID_HERE',
		token: 'EVERNOTE_DEVELOPER_TOKEN_HERE',
		sandbox: false
	},
	mongo: {
		db: 'MONGO_DB_NAME_HERE',
		host: 'localhost',
		port: 27017
	},
	twitter: {
		screenName: 'TWITTER_SCREEN_NAME_HERE',
		consumerKey: 'TWITTER_CONSUMER_KEY_HERE',
		consumerSecret: 'TWITTER_CONSUMER_SECRET_HERE',
		accessTokenKey: 'TWITTER_ACCESS_TOKEN_KEY_HERE',
		accessTokenSecret: 'TWITTER_ACCESS_TOKEN_SECRET_HERE'
	},
	facebook: {
		username: 'FACEBOOK_USERNAME_HERE',
		appId: 'FACEBOOK_APP_ID_HERE',
		secret: 'FACEBOOK_SECRET_HERE'
	}
}

module.exports = config;