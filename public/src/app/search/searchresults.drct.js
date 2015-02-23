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
      templateUrl: 'search/searchresults.partial.html',
      link: link
    };

    //---------------------

    function link(scope, element, attr) {
      scope.$watchGroup(['artists', 'albums'], function(results) {
        console.log(results);
      });
    }

  }


})();