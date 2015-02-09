(function() {
  

  angular.module('app')
    .directive('albumart', albumartDirective);

  ////////////////////////////

  function albumartDirective(lastfmFactory) {

    return {
      restrict: 'A',
      scope: {
        artist: '=',
        album: '=',
        size: '='
      },
      link: link
    };

    //---------------------

    function link(scope, element, attr) {
      scope.$watchGroup(['artist', 'album'], function(data) {
        if (scope.artist && scope.album) {
          var artist = scope.artist;
          var album = scope.album;
          if (artist && album) {
            lastfmFactory.albumInfo(artist, album).then(function(results) {
              try {
                element.css('background-image', 'url(' + results.album.image[scope.size]['#text'] + ')');
              } catch(e) {}
            });
          }
        }
      });
    }
  }


})();