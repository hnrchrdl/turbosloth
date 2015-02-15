(function() { 'use strict';


  angular.module('app')
    .controller( 'MainController', MainController);


  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  function MainController($rootScope, $location) {

    var vm = this;

    $rootScope.setLocation = setLocation;


    function setLocation(location) {
      if (location) {
        console.log('set location: ', location);
        $location.path(location);
      }
    }






  }


})();
