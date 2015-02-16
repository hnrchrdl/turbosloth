

(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'PlaylistsController', PlaylistsController); 



  /**
  *** Playlists Controller
  ***
  **/
  function PlaylistsController($scope, PlaylistFactory) {
    $scope.$on('playlists', function(e, playlistname) {
      PlaylistFactory.getPlaylist(playlistname).then(function(data) {
        console.log(data);
      });
    });
    
  }


})();
