

(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'PlaylistsController', PlaylistsController); 



  /**
  *** Playlists Controller
  ***
  **/

  //PlaylistsController.$inject = [ '$scope', '$http', '$compile']; 
  function PlaylistsController($scope, $http, $compile) {
    
    $scope.updateHtml = function() {
      $http.get( '/playlists' ).success(function( data ) {
        $scope.playlistsHtml = $compile( data )( $scope );
      }).error(function( err ) {
        $scope.playlistsHtml = err;
      });
    };
    
    $scope.updateHtml(); 
  }


})();
