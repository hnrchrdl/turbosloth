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
        size: '@'
      },
      link: link
    };

    //---------------------

    function link(scope, element, attr) {
      scope.$watchGroup(['artist', 'album'], function(data) {
        if (scope.artist && scope.album) {
          var artist = scope.artist;
          var album = scope.album;
          console.log(artist, album, scope.size);
          if (artist && album) {
            lastfmFactory.albumInfo(artist, album).then(function(results) {
              try {
                element.attr('src', results.album.image[scope.size]['#text']);
              } catch(e) {
                element.attr('src', 'http://static.last.fm/flatness/catalogue/noimage/noalbum_g3.png');
              }
            });
          }
        }
      });
    }
  }


})();