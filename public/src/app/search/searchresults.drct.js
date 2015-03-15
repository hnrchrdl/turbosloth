(function() {
  'use strict';



  angular.module('app')
    .directive('searchResults', searchResults);

  ////////////////////////////////

  function searchResults() {
    return {
      restrict: 'E',
      scope: {
        artists: '=',
        albums: "="
      },
      templateUrl: 'search/searchresults.partial.html'
    };

  }


})();