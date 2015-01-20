
(function() { 'use strict';
  
  angular.module('app')
    .directive('artistBio', ArtistBio);


  function ArtistBio (ArtistInfoFactory) {
    return {
      restrict: 'E',
      scope: '=',
      link: link
    }

    function link(scope, element, attr) {
      //element.text(scope.bio);
      console.log(scope.artistinfo);
      console.log('test');
      console.log(scope);
      element.text('check dis out');
    }
  }

})();