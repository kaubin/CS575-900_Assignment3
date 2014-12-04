'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
    socketio = require('socket.io'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path');

module.exports = function(db) {
	// Initialize express app
	var app = express();
	/*var server = require('http').createServer(app);*/
	/*var io = require('socket.io').listen(server);*/
	var server = http.createServer(app);
	var io = socketio.listen(server);
   	app.set('socketio', io);
    app.set('server', server);

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}



    // Keep track of which names are used so that there are no duplicates
    var userNames = (function () {
        var names = {};
        var sockets = {};

        var claim = function (name, sock) {
            if (!name || names[name]) {
                return false;
            } else {
                names[name] = true;
                sockets[name] = sock;
                return true;
            }
        };

        var find = function (name) {
            if (names[name]) {
                return names[name];
            }
            return;
        };

        // find the lowest unused "guest" name and claim it
        var getGuestName = function (sock) {
            var name,
                nextUserId = 1;
            do {
                name = 'Guest_' + nextUserId;
                nextUserId += 1;
            } while (!claim(name, sock));

            return name;
        };

        // serialize claimed names as an array
        var get = function () {
            var res = [];
            var u;
            for (u in names) {
                res.push(u);
            }

            return res;
        };

        // serialize name sockets as an array
        var getSocket = function () {
            var res = [];
            var s;
            for (s in sockets) {
                res.push(s);
            }

            return res;
        };

        var free = function (name) {
            if (names[name]) {
                delete names[name];
            }
        };

        return {
            claim: claim,
            free: free,
            get: get,
            getSocket: getSocket,
            getGuestName: getGuestName
        };
    }());

    io.sockets.on('connection', function (socket) {
        var name = userNames.getGuestName(socket);

        // send the new user their name and a list of users
        socket.emit('init', {
            name: name,
            users: userNames.get()
        });

        // Request socket initialization.
        // Occurs whenever page detects guest name is undefined.
        // Guest name could become invalid when browsing from room listing to a room.
        // See rooms.client.controller.js for code that detects this problem.
        socket.on('force:init', function (data) {
            // send the new user their name and a list of users
            socket.emit('init', {
                name: name,
                users: userNames.get()
            });
        });

        // notify other clients that a new user has joined
        socket.broadcast.emit('user:join', {
            name: name
        });

        // broadcast a user's message to other users
        socket.on('send:message', function (data) {

            console.log('ServerSide (Express.js) : Socket.On broadcast send::message');

            socket.broadcast.emit('send:message', {
                user: name,
                text: data.message
            });
        });

        socket.on('whisper:msg', function(data){
            var all_users = userNames.get();
            var all_sockets = userNames.getSocket();
           // data.msg, data.from_nick, data.to_nick

            console.log('attempt to locate: ' );
            var i, user;
            for (i = 0; i < all_users.length; i++) {
                user = all_users[i];
                if (user.toLocaleLowerCase() === data.from_nick.toLocaleLowerCase()) {
                    console.log('located: ' + data.from_nick);

                    if(all_sockets[i]){
                        console.log('Socket does not exist: ' + all_sockets[i]);
                    }

                    // TO DO: figure out why sockets are not resolving to alias
                    // Once that works, we can whisper with a spacific user
                    socket.broadcast.emit('send:message', {
//                    all_sockets[i].emit('send:message', {
                        user: data.to_nick,
                        text: data.msg
                    });
                    console.log('whispering message: ' + data.msg);
                    return;
                } else {
                    console.log('unable to locate, let client know they did not type existing user: ' + data.from_nick);
                }
            }
        });

        // validate a user's name change, and broadcast it on success
        socket.on('change:name', function (data, fn) {
            if (userNames.claim(data.name, socket)) {
                var oldName = name;
                userNames.free(oldName);

                name = data.name;

                socket.broadcast.emit('change:name', {
                    oldName: oldName,
                    newName: name
                });

                fn(true);
            } else {
                fn(false);
            }
        });

        // clean up when a user leaves, and broadcast it to other users
        socket.on('disconnect', function () {
            socket.broadcast.emit('user:left', {
                name: name
            });
            userNames.free(name);
        });
    });

	// Return Express server instance
	return app;
};
