
(function() { 'use strict';

  //angular.module('app.controller', [])
  
  angular.module('app')
    .controller( 'BrowseController', BrowseController); 


  /**
  *** Browse Controller
  ***
  **/
  function BrowseController($scope, BrowseFactory) {
    $scope.$on('browse', function(e, folder) {
      BrowseFactory.getPlaylist(folder).then(function(data) {
        console.log(data);
      });
    });
  }

})();
