

(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'PlaylistController', PlaylistController); 



  /**
  *** Playlists Controller
  ***
  **/
  function PlaylistController($scope, PlaylistFactory) {
    $scope.$on('playlists', function(e, playlistname) {
      PlaylistFactory.getPlaylist(playlistname).then(function(data) {
        console.log(data);
      });
    });
    
  }


})();
