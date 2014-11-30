'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Roommessage = mongoose.model('Roommessage'),
	_ = require('lodash');

/**
 * Create a Roommessage
 */
exports.create = function(req, res) {
	var roommessage = new Roommessage(req.body);
	roommessage.user = req.user;

	roommessage.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roommessage);
		}
	});
};

/**
 * Show the current Roommessage
 */
exports.read = function(req, res) {
	res.jsonp(req.roommessage);
};

/**
 * Update a Roommessage
 */
exports.update = function(req, res) {
	var roommessage = req.roommessage ;

	roommessage = _.extend(roommessage , req.body);

	roommessage.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roommessage);
		}
	});
};

/**
 * Delete an Roommessage
 */
exports.delete = function(req, res) {
	var roommessage = req.roommessage ;

	roommessage.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roommessage);
		}
	});
};

/**
 * List of Roommessages
 */
exports.list = function(req, res) { 
	Roommessage.find().sort('-created').populate('user', 'displayName').exec(function(err, roommessages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(roommessages);
		}
	});
};

/**
 * Roommessage middleware
 */
exports.roommessageByID = function(req, res, next, id) { 
	Roommessage.findById(id).populate('user', 'displayName').exec(function(err, roommessage) {
		if (err) return next(err);
		if (! roommessage) return next(new Error('Failed to load Roommessage ' + id));
		req.roommessage = roommessage ;
		next();
	});
};

/**
 * Roommessage authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.roommessage.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
