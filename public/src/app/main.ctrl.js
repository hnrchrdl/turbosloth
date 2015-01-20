(function() { 'use strict';


  angular.module('app')
    .controller( 'MainController', MainController);


  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  function MainController($rootScope, $route, $routeParams, $location) {
    $rootScope.location = 'queue';
    $rootScope.setLocation = setLocation;
    $location.path('/queue');

    $rootScope.$watch('location', setLocation);

    function setLocation(location) {
      if (location) {
        console.log(location);
        $rootScope.location = location;
        $location.path("/" + location);
      }
    };


    $rootScope.$on('search:artistDetailsRequest', function(e, name) {
      // broadcast artist details request to controller;
      $rootScope.$broadcast('search:artistDetails', name);
    });



    var socket = io();

    socket.on('connect', function () {
      console.log('established socket connection');
    });

    socket.on('clientError', function(msg) {
      console.log(msg);
    });

    socket.on('error', function (reason) {
      console.error('Unable to connect Socket.IO: ', reason);
    });

    socket.on('change', function(system) {
      switch(system) {

        case 'player':
          console.log('player changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:player');
          break;

        case 'options':
          console.log('options changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:options');
          break;

        case 'playlist':
          console.log('queue changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:queue');
          break;
      
        case 'stored_playlist':
          console.log('a stored playlist changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:storedPlaylist');
          break;
      }
    });
  }

})();