
(function() { 'use strict';


  angular.module('app', ['ngRoute'])
    .run(init)
    .run(locationWatcher)
    .run(socketWatcher);


  /////////////////////////////////////////


  function init($rootScope, CurrentSong, QueueFactory) {
    CurrentSong.getSongAndStatus().then(function(results) {
      $rootScope.$broadcast('change:player', results);
    });
    
    QueueFactory.getQueue().then(function(results) {
      $rootScope.$broadcast('change:queue', results);
    });
    
  }


  /**
  *** instantiate app
  *** listen for location changes on $rootScope
  **/
  function locationWatcher($rootScope, $location, $routeParams) {

    $rootScope.queueParams = false;
    $rootScope.searchParams = false;
    $rootScope.playlistsParams = false;
    $rootScope.browseParams = false;
    
    $rootScope.searchPath = 'search';

    $rootScope.$on('$locationChangeSuccess', locationChange);

    function locationChange() {

      var route = $location.path().split('/');

      switch(route[1]) {

        case 'queue':
          $rootScope.location = 'queue'; //show queue
          break;

        case 'search':
          $rootScope.location = 'search'; //show search

          if (route.length > 2) { // search has params

            switch (route[2]) {
              
              case 'artist':
                // artist search
                $rootScope.$broadcast('search:displayDetails:artist', {
                  artistname: route[3]
                });
                $rootScope.searchPath = $location.path();
                console.log($rootScope.searchPath);
                break;
              
              case 'album':
                // album search
                $rootScope.$broadcast('search:displayDetails:album', {
                  artistname: route[3],
                  albumname: route[4]
                });
                $rootScope.searchPath = $location.path();
                break;
            }
          } else { // no search mode specified
            $rootScope.$broadcast('search:displayDetails:none'); // empty out
            $rootScope.searchPath = $location.path();
          }
          break;

        default:
          $location.path('queue');
      }
    }

  }

  function socketWatcher($rootScope, socket, CurrentSong, QueueFactory) {

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
        case 'options':
          console.log('player changed. broadcasting to rootScope...');
          CurrentSong.getSongAndStatus().then(function(results) {
            $rootScope.$broadcast('change:player', results);
          });
          break;

        case 'playlist':
          console.log('queue changed. broadcasting to rootScope...');
          QueueFactory.getQueue().then(function(data) {
            $rootScope.$broadcast('change:queue', data);
          });
          break;
      
        case 'stored_playlist':
          console.log('a stored playlist changed. broadcasting to rootScope...');
          $rootScope.$broadcast('change:storedPlaylist');
          break;
      }

    });
    
  }


})();
