'use strict';

var _ = require('underscore');
var settings = require('./settings.js');
var express = require('express');
var app = express();
var fs = require('fs');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var Evernote = require('evernote').Evernote;
var Facebook = require('facebook-node-sdk');
var Twitter = require('twit');
var Passport = require('passport');
var EvernoteStrategy = require('passport-evernote').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var favicon = require('serve-favicon');
var grid = require('gridfs-stream');
var path = require('path');

// Log
if (settings.logger) {
	app.use(express.logger());
}

// Render static html files
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/web'));

// Evernote auth
Passport.serializeUser(function (user, done) {
	done(null, user);
});
Passport.deserializeUser(function (obj, done) {
	done(null, obj);
});
Passport.use(new EvernoteStrategy(
	{
		requestTokenURL: 'https://www.evernote.com/oauth',
		accessTokenURL: 'https://www.evernote.com/oauth',
		userAuthorizationURL: 'https://www.evernote.com/OAuth.action',
		consumerKey: settings.evernote.consumerKey,
		consumerSecret: settings.evernote.consumerSecret,
		callbackURL: settings.evernote.callbackURL
	},
	function () {}
));
app.use(favicon(__dirname + '/web/favicon.ico'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
	secret: settings.session.secret,
	saveUninitialized: true,
	resave: true
}));
app.use(Passport.initialize());
app.use(Passport.session());
// END evernote auth

// Setup db connection
var mongoClient;
MongoClient.connect(settings.mongo.url, function (err, client) {
	if (err) {
		throw err;
	}
	
	mongoClient = client;
	
	// Only start listening after connection to database is made
	app.listen(settings.port);
	console.log('Listening on port ' + settings.port);
});

app.get('/img/blog/:key([A-Za-z0-9]*)', function (req, res) {
	var gfs = grid(mongoClient, mongo);
	var blog = mongoClient.collection('blog');
	
	blog.find({key: req.params.key}).toArray(function (err, result) {
		if (err) {
			throw err;
		}
		
		if (result.length) {
			var readstream = gfs.createReadStream({
				filename: result[0].thumb
			});
			return readstream.pipe(res);
		}
		
		return res.status(404).end();
	});
});

app.get('/api/blog/(:key([A-Za-z0-9]*)|)', function (req, res) {
	var blog = mongoClient.collection('blog');
	var filter = null;
	
	if (req.params.key) {
		filter = {key: req.params.key};
	}
	
	blog.find(filter).sort({created: -1}).toArray(function (err, result) {
		// Don't return img file content
		_.each(result, function (note) {
			delete note.file;
		});
		
		// Return notes
		res.send(result);
	});
});

app.get('/api/feed', function (req, res) {
	// Get feed from mongo db
	var social = mongoClient.collection('social');
	social.find().sort({created: -1}).limit(25).toArray(function (err, result) {
		// Return social feed
		res.send(result);
	});
});

app.get('/api/refresh/blog', function (req, res) {
	var evernote = new Evernote.Client({
		token: settings.evernote.token,
		sandbox: settings.evernote.sandbox
	});
	
	var filter = new Evernote.NoteFilter();
	filter.notebookGuid = settings.evernote.blogNotebookGuid;
	filter.tagGuids = [settings.evernote.publishedTagGuid];
	
	var resultSpec = new Evernote.NotesMetadataResultSpec();
	resultSpec.includeTitle = true;
	resultSpec.includeCreated = true;
	resultSpec.includeTagGuids = true;
	
	var noteStore = evernote.getNoteStore();
	noteStore.findNotesMetadata(evernote.token, filter, 0, 10, resultSpec, function (error1, results) {
		var notes = [];
		var numCompleted = 0;
		
		noteStore.listTagsByNotebook(evernote.token, settings.evernote.blogNotebookGuid, function (error2, tagResults) {
			var allTags = tagResults;
			
			if (!error1 && !error2) {
				_.each(results.notes, function (content, note) {
					var key = results.notes[note].title
						.toLowerCase()
						.replace(/[^\w ]+/g, '')
						.replace(/ +/g, '-')
					;
					
					// get presentable tags
					var tags = _.filter(allTags, function (tag) {
						if (tag.guid != settings.evernote.publishedTagGuid) {
							return (results.notes[note].tagGuids.indexOf(tag.guid) >= 0);
						}
						return false;
					});
					tags = _.pluck(tags, 'name');
					
					notes[note] = {
						key: key,
						guid: results.notes[note].guid,
						title: results.notes[note].title,
						created: new Date(results.notes[note].created),
						tags: tags
					};
					
					// Get note content
					(function (note) {
						noteStore.getNote(evernote.token, notes[note].guid, true, true, false, false, function (error3, data) {
							if (!error3) {
								notes[note].content = data.content;
								
								if (data.resources && data.resources.length) {
									// Create buffer for blog image
									var buffer = new Buffer(data.resources[0].data.body.length);
									for (var i = 0; i < data.resources[0].data.body.length; i++) {
										buffer[i] = data.resources[0].data.body[i];
									}
									
									// Save blog image
									var tmpDir = __dirname + '/.tmp';
									if (!fs.existsSync(tmpDir)) {
										fs.mkdirSync(tmpDir);
									}
									var file = path.join(tmpDir, data.resources[0].attributes.fileName);
									fs.writeFile(file, buffer, 'binary', function (err) {
										if (err) {
											throw err;
										}
										
										var gfs = grid(mongoClient, mongo);
										var writestream = gfs.createWriteStream({
											filename: data.resources[0].attributes.fileName
										});
										fs.createReadStream(file).pipe(writestream);
									});
									
									// Save blog image filename to note
									notes[note].thumb = data.resources[0].attributes.fileName;
								}
								numCompleted++;
								
								if (numCompleted == results.totalNotes) {
									// Save to mongo db
									var blog = mongoClient.collection('blog');
									blog.remove({}, {w:1}, function () {
										blog.insert(notes, {w:1}, function () {
											// Return notes
											res.send(notes);
										});
									});
								}
							}
						});
					})(note);
				});
			}
			
			if (!notes.length) {
				// Save to mongo db
				var blog = mongoClient.collection('blog');
				blog.remove({}, {w:1}, function () {
					blog.insert(notes, {w:1}, function () {
						// return notes
						res.send(notes);
					});
				});
			}
		});
	});
});

app.get('/api/refresh/feed', function (req, res) {
	var feed = [];
	var numCompleted = 0;
	var total = 2;
	
	// Social integrations
	var facebook = new Facebook({
		appId: settings.facebook.appId,
		secret: settings.facebook.secret
	});
	var twitter = new Twitter({
		rest_base: 'https://api.twitter.com/1.1',
		consumer_key: settings.twitter.consumerKey,
		consumer_secret: settings.twitter.consumerSecret,
		access_token: settings.twitter.accessToken,
		access_token_secret: settings.twitter.accessTokenSecret
	});
	
	// Get public facebook posts
	facebook.api('/' + settings.facebook.username + '/posts?privacy={"value":"EVERYONE"}&limit=100', function (err, data) {
		numCompleted = numCompleted + 1;
		for (var id in data.data) {
			if (data.data[id].message || data.data[id].picture || data.data[id].description) {
				feed.push({
					type: 'facebook',
					type_url: 'https://facebook.com/' + settings.facebook.username,
					title: data.data[id].message,
					link: data.data[id].link,
					description: data.data[id].description,
					thumbnail: data.data[id].picture,
					created: new Date(data.data[id].created_time).getTime()
				});
			}
		}
		feed = feed.sort(function (a, b) {
			return (b.created - a.created);
		});
		feed = feed.slice(0, 9);
		if (numCompleted == total) {
			// Save to mongo db
			var social = mongoClient.collection('social');
			social.remove({}, {w:1}, function () {
				social.insert(feed, {w:1}, function () {
					// Return feed
					res.send(feed);
				});
			});
		}
	});
	
	// Get twitter posts
	twitter.get('/statuses/user_timeline', {screen_name: settings.twitter.screenName, count: 25}, function (err, data) {
		numCompleted = numCompleted + 1;
		for (var id in data) {
			if (data[id].text) {
				feed.push({
					type: 'twitter',
					type_url: 'https://twitter.com/' + settings.twitter.screenName,
					title: data[id].text,
					link: 'https://twitter.com/' + data[id].user.screen_name + '/status/' + data[id].id_str,
					description: '',
					thumbnail: null,
					created: new Date(data[id].created_at).getTime()
				});
			}
		}
		feed = feed.sort(function (a, b) {
			return (b.created - a.created);
		});
		feed = feed.slice(0, 9);
		if (numCompleted == total) {
			// Save to mongo db
			var social = mongoClient.collection('social');
			social.remove({}, {w:1}, function () {
				social.insert(feed, {w:1}, function () {
					// Return feed
					res.send(feed);
				});
			});
		}
	});
});

app.get('/blog/auth', Passport.authenticate('evernote'), function () {
	/*
	 * The request will be redirected to Evernote for authentication, so this
	 * function will not be called.
	 */
});

// 404, not found
app.get('*', function (req, res) {
	res.render(__dirname + '/web/404.html');
});
