'use strict';

(function() {

  var app = angular.module( 'app', [ 'ngRoute' ] );

  /**
  *** listen for location changes on $rootScope
  **/
  app.run([ '$rootScope', '$location', function( $rootScope, $location ) {
    $rootScope.$on( '$locationChangeSuccess', function() {
      $rootScope.location = $location.path().substring( 1 );
    });
  }]);


  /**
  *** filter to use in ng-bind-html to trust html
  **/
  app.filter( 'unsafe', function( $sce ) {
    return $sce.trustAsHtml;
  });


  /**
  *** Service to inject in controller/directive
  *** adapting the scrollable content to the view port
  **/
  app.service( 'fixScrollHeight', [ '$timeout', function( $timeout ) {
    this.apply = function( elementId ) {
      $timeout(function() {
        fixScrollHeight( elementId );
      });
    };
  }]);
  

  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  app.controller( 'MainController', [ '$scope', '$rootScope', '$route', '$routeParams', '$location', 
        function( $scope, $rootScope, $route, $routeParams, $location ) {
    
    $scope.main = 'queue';
    $location.path( '/queue' );
    
    $scope.$watch( 'location', function( newVal ) {
      if ( newVal ) $scope.setMain( newVal );
      console.log( 'MainController is set to: ' + $scope.main );
    });
    
    $scope.setMain = function( main ) {
      $scope.main = main;
      $location.path( "/" + main );
    };
    
    $scope.isMain = function( main ){
      return $scope.main === main;
    }

  }]);


  /**
  *** Queue Controller
  *** 
  **/
  app.controller( 'QueueController', [ '$scope', '$http', 'fixScrollHeight', 
        function( $scope, $http, fix ){
    
    $scope.html = "loading...";
    
    $scope.updateHtml = function() {
      $http.get('/queue'
      ).success(function( data ) {
        $scope.html = data;
        fix.apply( '#queue' );
      }).error(function( err ) {
        $scope.html = err;
      });
    };
    
    $scope.updateHtml(); 
  }]);


  /**
  *** Search Controller
  ***
  **/
  app.controller( 'SearchController', [ '$scope', '$http', '$compile', 'fixScrollHeight', 
              function( $scope, $http, $compile, fix ) {

    $scope.searchstring = '';
    $scope.searchtype = 'Artist';
    $scope.searchRequestHtml = '';

    $scope.artistDetailsName = '';
    $scope.artistDetailsHtml = '';

    $scope.setSearchType = function( type ) {
      $scope.searchtype = type;
    };

    $scope.$watch('searchstring', function() {
      if ( $scope.searchstring.length > 2 ) {
        $http.get( 'search-request', {
          params: {
            searchstring: $scope.searchstring,
            searchtype: $scope.searchtype
          }
        }).success(function( data ) {
          $scope.searchRequestHtml = $compile( data )( $scope );
        }).error(function( err ) {
          console.log( err );
        });
      } else {
        // user entered 2 or less characters
        $scope.searchRequestHtml = 'please enter 3 or more characters';
      }
    });

    $scope.$watch('artistDetails', function() {
      if ( $scope.artistDetailsName !== '' ) {
        $http.get( 'artist-details', {
          params: {
            artist: $scope.artistDetailsName
          }
        }).success(function( data ) {
          $scope.artistDetailsHtml = $compile( data )( $scope );
        }).error(function( err ) {
          console.log( err );
        });
      }
    });
  }]);

  /**
  *** Search Directive
  ***
  **/
  app.directive( 'searchRequest', function() {
    return {
      restrict: 'E',
      link: function( scope, element, attrs ){
        scope.$watch( 'searchRequestHtml', function(){
          console.log( 'new search request: ', scope.searchstring, scope.searchtype );
          element.empty();
          element.append( scope.searchRequestHtml );
        })
      }
    }
  });


  /**
  *** Artist Details Directive
  ***
  **/
  app.directive( 'artistDetails', function() {
     return {
      restrict: 'E',
      link: function( scope, element, attrs ) {
        scope.$watch( 'artistDetailsHtml', function() {
          element.empty();
          element.append( scope.ArtistDetailsHtml );
        });
      }
     }
  });


  /**
  *** Playlists Controller
  ***
  **/
  app.controller( 'PlaylistsController', [ '$scope', '$http', 'fixScrollHeight', 
        function( $scope, $http, fix ) {
    
    $scope.updateHtml = function() {
      $http.get( '/playlists' ).success(function( data ) {
        $scope.html = data;
        fix.apply( '#playlists' );
      }).error(function( err ) {
        $scope.html = err;
      });
    };
    
    $scope.updateHtml(); 
  }]);



  /**
  *** Browse Controller
  ***
  **/
  app.controller( 'BrowseController', [ '$scope', '$http', 'fixScrollHeight', 
        function( $scope, $http, fix ) {
    
    $scope.path = '';
    
    $scope.updateHtml = function() {
      $http.get('/browse', {
        params: { path: $scope.path }
      }).success(function( data ) {
        $scope.html = data;
        fix.apply( '#browse' );
      }).error(function( err ) {
        $scope.html = err;
      });
    };
    
    $scope.updateHtml();
  }]);


})();