(function() { 'use strict';
  

  angular.module('app')
    .directive('albumDirective', albumDirective);

  ///////////////////////////////////////

  function albumDirective(SearchFactory, lastfmFactory) {

    return {
      restrict: 'E',
      scope: {
        artistname: '=',
        albumname: '='
      },
      templateUrl: 'search/album/search.album.partial.html',
      link: link
    };

    //---------------------
    
    function link(scope, element, attr) {

      scope.$watch('[artistname, albumname]', function(data) {

        var artistname = data[0];
        var albumname = data[1];

        if (artistname && albumname) {

          // get the album from Mpd
          SearchFactory.getAlbumByName(artistname, albumname)
          .then(function(album) {
            console.log('album: ', album);
            scope.album = album;
          }, function(reason) {
            console.log(reason);
            scope.album = null;
          });
        }
      });
    }
  }


})();
