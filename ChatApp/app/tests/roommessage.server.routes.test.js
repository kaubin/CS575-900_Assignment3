'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Roommessage = mongoose.model('Roommessage'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, roommessage;

/**
 * Roommessage routes tests
 */
describe('Roommessage CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Roommessage
		user.save(function() {
			roommessage = {
				name: 'Roommessage Name'
			};

			done();
		});
	});

	it('should be able to save Roommessage instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roommessage
				agent.post('/roommessages')
					.send(roommessage)
					.expect(200)
					.end(function(roommessageSaveErr, roommessageSaveRes) {
						// Handle Roommessage save error
						if (roommessageSaveErr) done(roommessageSaveErr);

						// Get a list of Roommessages
						agent.get('/roommessages')
							.end(function(roommessagesGetErr, roommessagesGetRes) {
								// Handle Roommessage save error
								if (roommessagesGetErr) done(roommessagesGetErr);

								// Get Roommessages list
								var roommessages = roommessagesGetRes.body;

								// Set assertions
								(roommessages[0].user._id).should.equal(userId);
								(roommessages[0].name).should.match('Roommessage Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Roommessage instance if not logged in', function(done) {
		agent.post('/roommessages')
			.send(roommessage)
			.expect(401)
			.end(function(roommessageSaveErr, roommessageSaveRes) {
				// Call the assertion callback
				done(roommessageSaveErr);
			});
	});

	it('should not be able to save Roommessage instance if no name is provided', function(done) {
		// Invalidate name field
		roommessage.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roommessage
				agent.post('/roommessages')
					.send(roommessage)
					.expect(400)
					.end(function(roommessageSaveErr, roommessageSaveRes) {
						// Set message assertion
						(roommessageSaveRes.body.message).should.match('Please fill Roommessage name');
						
						// Handle Roommessage save error
						done(roommessageSaveErr);
					});
			});
	});

	it('should be able to update Roommessage instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roommessage
				agent.post('/roommessages')
					.send(roommessage)
					.expect(200)
					.end(function(roommessageSaveErr, roommessageSaveRes) {
						// Handle Roommessage save error
						if (roommessageSaveErr) done(roommessageSaveErr);

						// Update Roommessage name
						roommessage.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Roommessage
						agent.put('/roommessages/' + roommessageSaveRes.body._id)
							.send(roommessage)
							.expect(200)
							.end(function(roommessageUpdateErr, roommessageUpdateRes) {
								// Handle Roommessage update error
								if (roommessageUpdateErr) done(roommessageUpdateErr);

								// Set assertions
								(roommessageUpdateRes.body._id).should.equal(roommessageSaveRes.body._id);
								(roommessageUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Roommessages if not signed in', function(done) {
		// Create new Roommessage model instance
		var roommessageObj = new Roommessage(roommessage);

		// Save the Roommessage
		roommessageObj.save(function() {
			// Request Roommessages
			request(app).get('/roommessages')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Roommessage if not signed in', function(done) {
		// Create new Roommessage model instance
		var roommessageObj = new Roommessage(roommessage);

		// Save the Roommessage
		roommessageObj.save(function() {
			request(app).get('/roommessages/' + roommessageObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', roommessage.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Roommessage instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Roommessage
				agent.post('/roommessages')
					.send(roommessage)
					.expect(200)
					.end(function(roommessageSaveErr, roommessageSaveRes) {
						// Handle Roommessage save error
						if (roommessageSaveErr) done(roommessageSaveErr);

						// Delete existing Roommessage
						agent.delete('/roommessages/' + roommessageSaveRes.body._id)
							.send(roommessage)
							.expect(200)
							.end(function(roommessageDeleteErr, roommessageDeleteRes) {
								// Handle Roommessage error error
								if (roommessageDeleteErr) done(roommessageDeleteErr);

								// Set assertions
								(roommessageDeleteRes.body._id).should.equal(roommessageSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Roommessage instance if not signed in', function(done) {
		// Set Roommessage user 
		roommessage.user = user;

		// Create new Roommessage model instance
		var roommessageObj = new Roommessage(roommessage);

		// Save the Roommessage
		roommessageObj.save(function() {
			// Try deleting Roommessage
			request(app).delete('/roommessages/' + roommessageObj._id)
			.expect(401)
			.end(function(roommessageDeleteErr, roommessageDeleteRes) {
				// Set message assertion
				(roommessageDeleteRes.body.message).should.match('User is not logged in');

				// Handle Roommessage error error
				done(roommessageDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Roommessage.remove().exec();
		done();
	});
});