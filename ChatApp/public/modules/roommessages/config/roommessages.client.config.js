'use strict';

// Configuring the Articles module
angular.module('roommessages').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Roommessages', 'roommessages', 'dropdown', '/roommessages(/create)?');
		Menus.addSubMenuItem('topbar', 'roommessages', 'List Roommessages', 'roommessages');
		Menus.addSubMenuItem('topbar', 'roommessages', 'New Roommessage', 'roommessages/create');
	}
]);