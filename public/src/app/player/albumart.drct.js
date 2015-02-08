(function() {
  

  angular.module('app')
    .directive('albumart', albumartDirective);

  ////////////////////////////

  function albumartDirective(AlbumInfoFactory) {

    return {
      restrict: 'A',
      scope: {currentsong: '='},
      link: link
    };

    //---------------------

    function link(scope, element, attr) {
      scope.$watch('currentsong', function(data) {
        var artist = scope.currentsong.Artist;
        var album = scope.currentsong.Album;
        if (artist && album) {
          AlbumInfoFactory.getDetails(artist, album).then(function(results) {
            console.log('Album Details: ', results);
            try {
              element.css('background-image', 'url(' + results.album.image[2]['#text'] + ')');
            } catch(e) {}
          });
        }
      });
    }
  }


})();