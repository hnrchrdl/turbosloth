(function() { 'use strict';
  

  angular.module('app')
    .directive('searchAlbumDirective', searchAlbumDirective);

  ///////////////////////////////////////

  function searchAlbumDirective(
          AlbumInfoFactory
        , SearchFactory) {

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
          
          // get the album from Mpd
          SearchFactory.getAlbumByName(artist, album)
          .then(function(album) {
            console.log(album);
            scope.album = album;
          }, function(reason) {
            console.log(reason);
            scope.album = null;
          });
          
          // get the album details from lastFm
          AlbumInfoFactory.getDetails(artist, album)
          .then(function(albumDetails) {
            console.log(albumDetails);
            scope.albumDetails = albumDetails;
          }, function(reason) {
            console.log(reason);
            scope.albumDetails = {};
          });
        }
      });
    }
  }


})();
