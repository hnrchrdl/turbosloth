(function() { 'use strict';


  angular.module('app')
    .controller( 'MainController', MainController);


  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  function MainController($rootScope, $scope, $location, $routeParams, $timeout) {

    $rootScope.setLocation = setLocation;

    function setLocation(location) {
      if (location) {
        console.log('set location: ', location);
        $location.path(location);
      }
    }

    //resolving route params
    $scope.$on('browse:artist', function() {
      $timeout(function() {
        $scope.artistParams = {
          artistname: $routeParams.artist
        };
      });
    });

    $scope.$on('browse:album', function() {
      $timeout(function() {
        $scope.albumParams = {
          artistname: $routeParams.artist,
          albumname: $routeParams.album
        };
      });
    });

    $scope.$on('browse:playlists', function() {
      $timeout(function() {
        $rootScope.playlistsParams = {
          playlistname: $routeParams.playlist
        };
      });
    });


    $scope.$on('browse:browse', function() {
      $timeout(function() {
        $rootScope.browseParams = {
          folder: $routeParams.folder
        };
      });
    });



  }


})();
