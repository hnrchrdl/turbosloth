
(function() { 'use strict';


  angular.module('app', 
  [
    'app.controller', 
    'app.directives', 
    'app.factories', 
    'app.services', 
    'ngRoute'
  ])
    .run(runApp);


  /**
  *** instantiate app
  *** listen for location changes on $rootScope
  **/
  runApp.$inject = [ '$rootScope', '$location'];

  function runApp($rootScope, $location) {
    $rootScope.$on('$locationChangeSuccess', function() {
      $rootScope.location = $location.path().substring(1);
    });
  }


})();