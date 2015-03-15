(function() { 'use strict';
  

  angular.module('app')
    .directive('showAlbumDirective', showAlbumDirective);

  ///////////////////////////////////////

  function showAlbumDirective(SearchFactory, lastfmFactory) {

    return {
      restrict: 'E',
      scope: {
        artistname: '=',
        albumname: '='
      },
      templateUrl: 'album/album.partial.html',
      link: link
    };

    //---------------------
    
    function link(scope, element, attr) {

      scope.$watch('[artistname, albumname]', function(data) {

        scope.album = null;
        scope.loading = true;

        var artistname = data[0];
        var albumname = data[1];

        if (artistname && albumname) {

          // get the album from Mpd
          SearchFactory.getAlbumByName(artistname, albumname)
          .then(function(album) {
            console.log('album: ', album);
            scope.album = album;
            scope.loading = false;
          }, function(reason) {
            console.log(reason);
            scope.album = null;
            scope.loading = false;
          });
        }
      });
    }
  }


})();
