'use strict';

// Rooms controller
angular.module('rooms').controller('RoomsController', ['$scope', '$stateParams', '$location', 'Socket', 'Authentication', 'Rooms', 'Roommessages',
    function ($scope, $stateParams, $location, Socket, Authentication, Rooms, Roommessages) {
        $scope.authentication = Authentication;
        //$scope.socket = Socket;

         Socket.on('room.created', function(room) {
            console.log('Client Side: room.server.controller just created a room');
         });

        // Create new Room
        $scope.create = function (showRoom) {
            // Create new Room object
            var room = new Rooms({
                name: this.name
            });

            console.log('Client Side: Create Method in room client controller');

            // Redirect after save
            room.$save(function (response) {
                if (showRoom) {
                	$location.path('rooms/' + response._id);
                }
                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            if (!showRoom) {
                $location.path('/rooms');
            }
        };

        // Remove existing Room
        $scope.remove = function (room) {

            console.log('Remove Method in room client controller');

            if (room) {
                room.$remove();

                for (var i in $scope.rooms) {
                    if ($scope.rooms [i] === room) {
                        $scope.rooms.splice(i, 1);
                    }
                }
                $location.path('/rooms');
            } else {
                $scope.room.$remove(function () {
                    $location.path('rooms');
                });
            }
        };

        // Update existing Room
        $scope.update = function () {
            var room = $scope.room;

            console.log('Client Side: Update Method in room client controller');

            room.$update(function () {
                $location.path('rooms/' + room._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.edit = function(room) {
            if ( room ) {
                room.$update(function() {

                    $location.path('/rooms/' + room._id + '/edit');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

                /*$location.path('/rooms');*/
            } else {
                $scope.room.$remove(function() {
                    $location.path('rooms');
                });
            }
        };

        // Verify socket.io user is valid, request socket reinitialization when invalid.
        // Occurs whenever page detects guest name is undefined.
        // Guest name could become invalid when browsing from room listing to a room.
        // See rooms.client.controller.js for code that detects this problem.
        var checkSocket = function () {
            if (!$scope.name) {

                Socket.emit('force:init', {
                    message: 'Socket uninitialized: sending force:init to server'
                });
            }
        };

        // Find a list of Rooms
        $scope.find = function () {
            $scope.rooms = Rooms.query();

            // Verify socket.io user is valid.
            checkSocket();
        };

        // Find existing Room
        $scope.findOne = function () {
            $scope.room = Rooms.get({
                roomId: $stateParams.roomId
            });

            // Verify socket.io user is valid.
            checkSocket();
        };

        $scope.EnterRoom = function(room) {
            $location.path('rooms/' + $scope.rooms[room]._id);
        };

        // Socket listeners
        // ================

        Socket.on('init', function (data) {
            $scope.name = data.name;
            $scope.users = data.users;

            console.log('Client Side: init NAME: ' + $scope.name);
            console.log('Client Side: init USERS: ' + $scope.users);

        });

        Socket.on('send:message', function (message) {
            $scope.messages.push(message);
            //var m = 'User ' + message.user + ' sent message '+ message.text;
            //console.log('Client Side: Message received ' + m);
        });

        Socket.on('change:name', function (data) {
            changeName(data.oldName, data.newName);
        });

        Socket.on('user:join', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has joined.'
            });
            $scope.users.push(data.name);
        });

        // add a message to the conversation when a user disconnects or leaves the room
        Socket.on('user:left', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has left.'
            });
            var i, user;
            for (i = 0; i < $scope.users.length; i++) {
                user = $scope.users[i];
                if (user === data.name) {
                    $scope.users.splice(i, 1);
                    break;
                }
            }
        });

        Socket.on('chat:error', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: data.text
            });
        });

        // ======= Private helpers =======

        var changeName = function (oldName, newName) {
            // rename user in list of users
            var i;
            for (i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i] === oldName) {
                    $scope.users[i] = newName;
                }
            }

            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + oldName + ' is now known as ' + newName + '.'
            });
        };

        // Methods published to the scope
        // ==============================

        $scope.changeName = function () {
            Socket.emit('change:name', {
                name: $scope.newAlias
            }, function (result) {
                if (!result) {
                    alert('There was an error changing your name');
                } else {

                    changeName($scope.name, $scope.newAlias);

                    $scope.name = $scope.newAlias;
                    $scope.newAlias = '';
                }
            });
        };

        $scope.messages = [];

        // Returns false when broadcast is unnecessary
        function TrimCommands(data) {
            var msg = data.trim();
            if(msg.substr(0,3) === '/w '){
                msg = msg.substr(3);
                var ind = msg.indexOf(' ');
                if(ind !== -1){
                    var name = msg.substring(0, ind);
                    msg = msg.substring(ind + 1);

                    var i, user;
                    for (i = 0; i < $scope.users.length; i++) {
                        user = $scope.users[i];

                        if (user.toLocaleLowerCase() === name.toLocaleLowerCase()) {
                            Socket.emit('whisper:msg', {msg: msg, from_nick: $scope.name, to_nick: name});
                            console.log('requesting whisper message: ' + msg);
                            return { m : msg, emit : false };
                        }
                    }
                }
            } else if(msg.substr(0,3) === '/c '){
                var newName = msg.substr(3);
                if(newName){
                    console.log('Name change: '+ $scope.name + '  now ' + newName);
                    changeName($scope.name, newName);
                    $scope.newAlias = '';
                }
            }
            return { m : msg, emit : true };
        }

        $scope.sendMessage = function () {
            console.log('Client Side: SendMessage');
            var room = $scope.room;
            var cMsg = $scope.message.trim();

            var rslt = TrimCommands(cMsg);

            // Create message to add to message history database

            // Create new Roommessage object
            var roommessage = new Roommessages ({
                room_name: room._id,
                user_name: $scope.name,
                msg: cMsg
            });

            // Emit saved message upon success
            roommessage.$save(function(response) {
                if (rslt.emit) {
                    console.log('sending message: ' + cMsg);
                    Socket.emit('send:message', {
                        message: cMsg
                    });
                }
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // store msg locally
            $scope.messages.push({
                user: $scope.name,
                text: cMsg
            });

            // clear message box
            $scope.message = '';
        };
    }
]);