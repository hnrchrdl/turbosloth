(function() { 'use strict';
  

  angular.module('app')
    .directive('searchAlbumDirective', searchAlbumDirective);

  ///////////////////////////////////////

  function searchAlbumDirective(
          AlbumInfoFactory
        , SearchAlbumsFactory) {

    return {
      restrict: 'E',
      scope: {
        artist: '=',
        album: '='
      },
      templateUrl: 'search/album/search.album.partial.html',
      link: link
    };

    //---------------------
    
    function link(scope, element, attr) {

      scope.$watch('[artist, album]', function(data) {

        var artist = data[0];
        var album = data[1];

        console.log(data);

        if (artist && album) {

          console.log(artist, album);
          scope.album = {};
        }
      });
    }
  }


})();