'use strict';

//Roommessages service used to communicate Roommessages REST endpoints
angular.module('roommessages').factory('Roommessages', ['$resource',
	function($resource) {
		return $resource('roommessages/:roommessageId', { roommessageId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);