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

      switch (scope.size) {
        case '0':
        case '1':
          var fallbackURL = '/img/no_img_avail_100.png';
          break;
        case '2':
        case '3':
          var fallbackURL = '/img/no_img_avail_250.png';
          break;
        case '4':
          var fallbackURL = '/img/no_img_avail_500.png';
      }


      scope.$watchGroup(['artist', 'album'], function(data) {

        if (data[0] && data[1]) {
          lastfmFactory.albumInfo(data[0], data[1]).then(function(results) {
            try {
              var url = results.album.image[scope.size]['#text'];
              if (url && url !== "") {
                element.attr('src', url);
              } else {
                throw new Error();
              }
            } catch(e) {
              element.attr('src', fallbackURL);
            }
          });
        } else {
          element.attr('src', fallbackURL);
        }
      });
    }
  }


})();