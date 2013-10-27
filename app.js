var settings = require('./settings.js');
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var Evernote = require('evernote').Evernote;
var Facebook = require('facebook-node-sdk');
var Twitter = require('ntwitter');
var Passport = require('passport');
var EvernoteStrategy = require('passport-evernote').Strategy;

// log
if (settings.logger) {
	app.use(express.logger());
}

// render static html files
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/web'));

// Evernote auth
Passport.serializeUser(function(user, done) {
	done(null, user);
});
Passport.deserializeUser(function(obj, done) {
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
	function(token, tokenSecret, profile, done) {}
));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: settings.session.secret }));
app.use(Passport.initialize());
app.use(Passport.session());
// END evernote auth

// setup db connection
function getClient() {
	return new MongoClient(new Server(settings.mongo.host, settings.mongo.port));
}

app.get('/api/blog/(:key([A-Za-z0-9]*)|)', function(req, res) {
	mongoClient = getClient();
	var notes = [];
	
	mongoClient.open(function(err, mongoClient) {
		db = mongoClient.db(settings.mongo.db);
		var blog = db.collection('blog');
		var filter = null;
		
		if (req.params.key) {
			filter = {key: req.params.key};
		}
		
		blog.find(filter).sort({created: -1}).toArray(function(err, result) {
			mongoClient.close();
			
			// return notes
			res.send(result);
		});
	});
});

app.get('/api/feed', function(req, res) {
	mongoClient = getClient();
	var feed = [];
	
	// get feed from mongo db
	mongoClient.open(function(err, mongoClient) {
		db = mongoClient.db(settings.mongo.db);
		var social = db.collection('social');
		social.find().sort({created: -1}).limit(25).toArray(function(err, result) {
			mongoClient.close();
			
			// return social feed
			res.send(result);
		});
	});
});

app.get('/api/refresh/blog', function(req, res) {
	mongoClient = getClient();
	var evernote = new Evernote.Client({
		token: settings.evernote.token,
		sandbox: settings.evernote.sandbox
	});
	
	var filter = new Evernote.NoteFilter();
	filter.notebookGuid = settings.evernote.notebookGuid; // Blog notebook
	filter.tagGuids = [settings.evernote.tagGuid]; // published tag
	
	var result_spec = new Evernote.NotesMetadataResultSpec();
	result_spec.includeTitle = true;
	result_spec.includeUpdated = true;
	
	var note_store = evernote.getNoteStore();
	note_store.findNotesMetadata(evernote.token, filter, 0, 10, result_spec, function(results) {
		var notes = [];
		var num_completed = 0;
		
		for (note in results.notes) {
			var key = results.notes[note].title
				.toLowerCase()
				.replace(/[^\w ]+/g,'')
				.replace(/ +/g,'-')
			;
			
			notes[note] = {
				key: key,
				guid: results.notes[note].guid,
				title: results.notes[note].title,
				created: new Date(results.notes[note].updated)
			};
			
			// get note content
			(function(note) {
				note_store.getNote(evernote.token, notes[note].guid, true, true, false, false, function(data) {
					notes[note].content = data.content;
					
					if (data.resources && data.resources.length) {
						notes[note].thumb = data.resources[0].attributes.fileName;
					}
					num_completed++;
					
					if (num_completed == results.totalNotes) {
						// save to mongo db
						mongoClient.open(function(err, mongoClient) {
							db = mongoClient.db(settings.mongo.db);
							var blog = db.collection('blog')
							blog.remove({}, {w:1}, function(err, result) {
								blog.insert(notes, {w:1}, function(err, result) {
									mongoClient.close();
									
									// return notes
									res.send(notes);
								});
							});
						});
					}
				});
			})(note);
		}
		if (!notes.length) {
			// save to mongo db
			mongoClient.open(function(err, mongoClient) {
				db = mongoClient.db(settings.mongo.db);
				var blog = db.collection('blog')
				blog.remove({}, {w:1}, function(err, result) {
					blog.insert(notes, {w:1}, function(err, result) {
						mongoClient.close();
						
						// return notes
						res.send(notes);
					});
				});
				
				// return notes
				res.send(notes);
			});
		}
	});
});

app.get('/api/refresh/feed', function(req, res) {
	mongoClient = getClient();
	var feed = [];
	var num_completed = 0;
	var total = 2;
	
	// social integrations
	var facebook = new Facebook({
		appId: settings.facebook.appId,
		secret: settings.facebook.secret
	});
	var twitter = new Twitter({
		rest_base: 'https://api.twitter.com/1.1',
		consumer_key: settings.twitter.consumerKey,
		consumer_secret: settings.twitter.consumerSecret,
		access_token_key: settings.twitter.accessTokenKey,
		access_token_secret: settings.twitter.accessTokenSecret
	});
	
	// get public facebook posts
	facebook.api('/' + settings.facebook.username + '/posts?privacy={"value":"EVERYONE"}&limit=100', function(err, data) {
		num_completed = num_completed + 1;
		for (var id in data['data']) {
			feed.push({
				'type': 'facebook',
				'type_url': 'https://facebook.com/' + settings.facebook.username,
				'title': data['data'][id]['message'],
				'link': data['data'][id]['link'],
				'description': data['data'][id]['description'],
				'thumbnail': data['data'][id]['picture'],
				'created': new Date(data['data'][id]['created_time']).getTime()
			});
		}
		feed = feed.sort(function(a, b) {
			return (b['created'] - a['created']);
		});
		feed = feed.slice(0, 9);
		if (num_completed == total) {
			// save to mongo db
			mongoClient.open(function(err, mongoClient) {
				db = mongoClient.db(settings.mongo.db);
				var social = db.collection('social')
				social.remove({}, {w:1}, function(err, result) {
					social.insert(feed, {w:1}, function(err, result) {
						mongoClient.close();
						
						// return feed
						res.send(feed);
					});
				});
			});
		}
	});
	
	// get twitter posts
	twitter.get('/statuses/user_timeline.json', {screen_name: settings.twitter.screenName, count: 25}, function (err, data) {
		num_completed = num_completed + 1;
		for (var id in data) {
			feed.push({
				'type': 'twitter',
				'type_url': 'https://twitter.com/' + settings.twitter.screenName,
				'title': data[id]['text'],
				'link': 'https://twitter.com/' + data[id]['user']['screen_name'] + '/status/' + data[id]['id_str'],
				'description': '',
				'thumbnail': null,
				'created': new Date(data[id]['created_at']).getTime()
			});
		}
		feed = feed.sort(function(a, b) {
			return (b['created'] - a['created']);
		});
		feed = feed.slice(0, 9);
		if (num_completed == total) {
			// save to mongo db
			mongoClient.open(function(err, mongoClient) {
				db = mongoClient.db(settings.mongo.db);
				var social = db.collection('social')
				social.remove({}, {w:1}, function(err, result) {
					social.insert(feed, {w:1}, function(err, result) {
						mongoClient.close();
						
						// return feed
						res.send(feed);
					});
				});
			});
		}
	});
	
});

app.get('/blog/auth', Passport.authenticate('evernote'), function(req, res) {
	// The request will be redirected to Evernote for authentication, so this
	// function will not be called.
});

// 404, not found
app.get('*', function(req, res){
	res.render(__dirname + '/web/404.html');
});

app.listen(settings.port);