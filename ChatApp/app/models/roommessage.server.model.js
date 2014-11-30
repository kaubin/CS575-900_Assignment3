'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Roommessage Schema
 */
var RoommessageSchema = new Schema({
	room_name: {
		type: String,
		default: '',
		required: 'Please fill room_name',
		trim: true
	},
    user_name: {
        type: String,
        default: '',
        required: 'Please fill user_name',
        trim: true
    },
    msg: {
        type: String,
        default: '',
        required: 'Please fill msg',
        trim: true
    },
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Roommessage', RoommessageSchema);