'use strict';

//Setting up route
angular.module('roommessages').config(['$stateProvider',
	function($stateProvider) {
		// Roommessages state routing
		$stateProvider.
		state('listRoommessages', {
			url: '/roommessages',
			templateUrl: 'modules/roommessages/views/list-roommessages.client.view.html'
		}).
		state('createRoommessage', {
			url: '/roommessages/create',
			templateUrl: 'modules/roommessages/views/create-roommessage.client.view.html'
		}).
		state('viewRoommessage', {
			url: '/roommessages/:roommessageId',
			templateUrl: 'modules/roommessages/views/view-roommessage.client.view.html'
		}).
		state('editRoommessage', {
			url: '/roommessages/:roommessageId/edit',
			templateUrl: 'modules/roommessages/views/edit-roommessage.client.view.html'
		});
	}
]);