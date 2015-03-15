
(function() { 'use strict';


  angular.module('app', ['ngRoute'])
    .config(routeConfig)
    .run(init)
    //.run(locationWatcher)
    .run(socketWatcher);


  /////////////////////////////////////////

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/queue', {
        resolve: {
          location: function($rootScope) { 
            $rootScope.location = 'queue';
          }
        }
      })
      .when('/artist/:artist', {
        resolve: {
          location: function($rootScope) { 
            $rootScope.location = 'artist';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:artist');
          }
        }
      })
      .when('/artist/:artist/album/:album', {
        resolve: {
          location: function($rootScope) { 
            $rootScope.location = 'album';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:album');
          }
        }
      })
      .when('/playlists', {
        resolve: {
          location: function($rootScope) { 
            $rootScope.location = 'playlists';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:playlists');
          }
        }
      })
      .when('/playlists/:playlist', {
        resolve: {
          location: function($rootScope) { 
            $rootScope.location = 'playlists';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:playlists');
          }
        }
      })
      .when('/browse', {
        resolve: {
          location: function($rootScope) { 
            console.log('browse');
            $rootScope.location = 'browse';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:browse');
          }
        }
      })
      .when('/browse/:folder', {
        resolve: {
          location: function($rootScope) {
            console.log('browsefolder');
            $rootScope.location = 'browse';
          },
          params: function($rootScope) {
            $rootScope.$broadcast('browse:browse');
          }
        }
      })
      .otherwise('/queue');


  }


  function init($rootScope, $routeParams, $location, CurrentSong, QueueFactory) {
    CurrentSong.getSongAndStatus().then(function(results) {
      $rootScope.$broadcast('change:player', results);
    });
    
    QueueFactory.getQueue().then(function(results) {
      $rootScope.$broadcast('change:queue', results);
    });


    // working around nasty button focus issues 
    //$(document).on('mouseup', '.btn' , function(){
    //  $(this).blur();
    //});

    
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
      console.log('change in system: ', system);
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
          $rootScope.$broadcast('change:stored_playlist');
          break;
      }

    });
    
  }


})();
