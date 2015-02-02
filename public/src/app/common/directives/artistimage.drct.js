(function() { 'use strict';
  
  angular.module('app')
    .directive('artistDirective', ArtistDirective);

  ///////////////////////////////////////

  function ArtistDirective() {

    return {
      restrict: 'E',
      scope: '=',
      templateUrl: 'common/partials/artistimage.partial.html',
      link: link,
      controller: artistDirectiveController
    }

    //---------------------

    function link(scope, element, attr) {
      element.css('background-image', 'url(' + scope.artist.imageUrl + ')');
      if (!scope.artist.inDatabase) {
        element.find('.album').addClass('not-in-db');
        element.find('i').remove();
      }
    }

    function artistDirectiveController(MpdFactory) {

    }

  }

})();