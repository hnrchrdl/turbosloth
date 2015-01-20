
(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'BrowseController', BrowseController); 


  /**
  *** Browse Controller
  ***
  **/

  //BrowseController.$inject = [ '$scope', '$http', '$compile'];

  function BrowseController($scope, $http, $compile) {
    
    $scope.path = '';
    
    $scope.updateHtml = function() {
      $http.get( '/browse', {
        params : {
          path : $scope.path
        }
      }).success(function( data ) {
        $scope.browseHtml = $compile( data )( $scope );
      }).error(function( err ) {
        $scope.browseHtml = err;
      });
    };
    
    $scope.updateHtml();
  }

})();