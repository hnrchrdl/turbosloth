
(function() { 'use strict';


  angular.module('app', ['ngRoute'])
    .run(locationWatcher)
    .config(routes);


  /**
  *** instantiate app
  *** listen for location changes on $rootScope
  **/
  function locationWatcher($rootScope, $location) {

    $rootScope.$on('$locationChangeSuccess', function() {
      
      $rootScope.location = $location.path().substring(1);
    });
  }

  function routes($routeProvider, $locationProvider) {
    //$routeProvider
    //  .when('/queue', {
    //    console.log('check queue');
    //});
  };


})();