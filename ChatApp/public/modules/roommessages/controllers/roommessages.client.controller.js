'use strict';

// Roommessages controller
angular.module('roommessages').controller('RoommessagesController', ['$scope', '$stateParams', '$location', 'Socket', 'Authentication', 'Roommessages',
	function($scope, $stateParams, $location, Socket, Authentication, Roommessages) {
		$scope.authentication = Authentication;

		// Create new Roommessage
		$scope.create = function() {
			// Create new Roommessage object
			var roommessage = new Roommessages ({
                room_name: this.room_name,
                user_name: this.user_name,
                msg: this.msg
			});

			// Redirect after save
			roommessage.$save(function(response) {
				$location.path('roommessages/' + response._id);

				// Clear form fields
                $scope.room_name = '';
                $scope.user_name = '';
				$scope.msg = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Roommessage
		$scope.remove = function(roommessage) {
			if ( roommessage ) { 
				roommessage.$remove();

				for (var i in $scope.roommessages) {
					if ($scope.roommessages [i] === roommessage) {
						$scope.roommessages.splice(i, 1);
					}
				}
			} else {
				$scope.roommessage.$remove(function() {
					$location.path('roommessages');
				});
			}
		};

		// Update existing Roommessage
		$scope.update = function() {
			var roommessage = $scope.roommessage;

			roommessage.$update(function() {
				$location.path('roommessages/' + roommessage._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Roommessages
		$scope.find = function() {
			$scope.roommessages = Roommessages.query();
		};

		// Find existing Roommessage
		$scope.findOne = function() {
			$scope.roommessage = Roommessages.get({ 
				roommessageId: $stateParams.roommessageId
			});
		};
	}
]);