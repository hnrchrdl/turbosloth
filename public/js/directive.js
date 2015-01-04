
(function() { 'use strict';

  angular.module('app.directives', [])
    .directive('keypressEvents', KeyPressDirective)
    .directive('queueDirective', QueueDirective)
    .directive('queueOptionsDirective', QueueOptionsDirective)
    .directive('queueSaveDirective', QueueSaveDirective)
    .directive('queueShuffleDirective', QueueShuffleDirective)
    .directive('queueClearDirective', QueueClearDirective)
    .directive('queuePlaylistSelectDirective', QueuePlaylistSelectDirective)
    .directive('searchContainerDirective', SearchContainerDirective)
    .directive('searchRequestDirective', SearchRequestDirective)
    .directive('searchArtistDetailsDirective', SearchArtistDetailsDirective)
    .directive('playlistsDirective', PlaylistsDirective)
    .directive('browseDirective', BrowseDirective);


  KeyPressDirective.$inject = ['$document', '$rootScope'];
  
  function KeyPressDirective($document, $rootScope) {
    return {
      restrict: 'A',
      link: link
    };

    function link() {
      $document
        .bind('keydown', keydown)
        .bind('keypress', keypress);

      function keydown(e) {
        console.log('Got keydown:', e.which);
        $rootScope.$broadcast('keydown:' + e.which, e);
      };

      function keypress(e) {
        console.log('Got keypress:', e.which);
        $rootScope.$broadcast('keypress:' + e.which, e);
      };
    }

  }



  /**
  *** Queue Directives
  **/
  function QueueDirective() {
    return {
      restrict: 'E',
      link: link,
      //require: '^QueueController',
      templateUrl: '../templates/queue.html'
    };

    function link (scope, element, attrs) {
      
    }
  }

  function QueueOptionsDirective() {
    return {
      restrict: 'E',
      //require: '^QueueController',
      templateUrl: '../templates/queue-options.html'
    };
  }

  function QueueSaveDirective() {
    return {
      restrict: 'E',
      //require: '^QueueController',
      templateUrl: '../templates/queue-save.html'
    };
  }

  function QueueShuffleDirective() {
    return {
      restrict: 'E',
      //require: '^QueueController',
      templateUrl: '../templates/queue-shuffle.html'
    };
  }

  function QueueClearDirective() {
    return {
      restrict: 'E',
      //require: '^QueueController',
      templateUrl: '../templates/queue-clear.html'
    };
  }


  

  /**
  *** Playlists Directive
  **/
  function QueuePlaylistSelectDirective () {
    return {
      restrict: 'E',
      //controller : playlistSelect,
      templateUrl: '../templates/queue-playlist-select.html'
    };
  }



  /**
  *** Search Directive
  **/


  function SearchContainerDirective() {
    return {
      restrict: 'E',
      templateUrl: '../templates/search-container.html'
    };
  }


  SearchRequestDirective.$inject = ['$http'];

  function SearchRequestDirective ($http) {
    return {
      restrict: 'E',
      templateUrl: '../templates/search-results.html',
    };

  }




  /**
  *** Artist Details Directive
  **/
  function SearchArtistDetailsDirective() {
    return {
      restrict: 'E',
      //link: link
      templateUrl: '../templates/search-artist-details.html'
    };

    function link(scope, element, attrs) {

      scope.$watch('artistDetailsHtml', function() {
        element.empty();
        element.append( scope.ArtistDetailsHtml );
      });
    }

  }




  /**
  *** Playlists Directive
  **/
  function PlaylistsDirective() {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, element, attrs) {
      scope.$watch('playlistsHtml', function() {
        element.empty();
        element.append(scope.playlistsHtml);
      });
    }
  }



  /**
  *** Browse Directive
  **/
  function BrowseDirective() {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, element, attrs) {
      scope.$watch('browseHtml', function() {
        element.empty();
        element.append(scope.browseHtml);
      });
    }
  }


})();
