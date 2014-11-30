'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var roommessages = require('../../app/controllers/roommessages.server.controller');

	// Roommessages Routes
	app.route('/roommessages')
		.get(roommessages.list)
		.post(users.requiresLogin, roommessages.create);

	app.route('/roommessages/:roommessageId')
		.get(roommessages.read)
		.put(users.requiresLogin, roommessages.hasAuthorization, roommessages.update)
		.delete(users.requiresLogin, roommessages.hasAuthorization, roommessages.delete);

	// Finish by binding the Roommessage middleware
	app.param('roommessageId', roommessages.roommessageByID);
};
