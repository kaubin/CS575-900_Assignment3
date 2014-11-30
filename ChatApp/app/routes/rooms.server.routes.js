'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var rooms = require('../../app/controllers/rooms.server.controller');
//    var roomMessages = require('../../app/controllers/roommessages.server.controller');

	// Rooms Routes
	app.route('/rooms')
		.get(rooms.list)
//        .get(roomMessages.list)
		.post(users.requiresLogin, rooms.create);

	app.route('/rooms/:roomId')
		.get(rooms.read)
//        .get(roomMessages.read)
		.put(users.requiresLogin, rooms.hasAuthorization, rooms.update)
		.delete(users.requiresLogin, rooms.hasAuthorization, rooms.delete);

	// Finish by binding the Room middleware
	app.param('roomId', rooms.roomByID);
};
