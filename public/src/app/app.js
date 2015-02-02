
(function() { 'use strict';


  angular.module('app', ['ngRoute'])
    .config(routes)
    .run(locationWatcher);


  /**
  *** instantiate app
  *** listen for location changes on $rootScope
  **/
  function locationWatcher($rootScope, $location, $routeParams) {

    $rootScope.$on('$locationChangeSuccess', function() {
      $rootScope.location = $location.path().substring(1);
    });
  }

  function routes($routeProvider, $locationProvider) {
    console.log($locationProvider);
    $routeProvider
    .when('/queue', {
        resolve: function() {
          console.log('gggggg');
        }
    });
  };


})();