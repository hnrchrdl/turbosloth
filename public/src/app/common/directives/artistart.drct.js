(function() {
  

  angular.module('app')
    .directive('artistimage', artistimageDirective);

  ////////////////////////////

  function artistimageDirective(lastfmFactory) {

    return {
      restrict: 'A',
      scope: {
        artist: '=',
        size: '@'
      },
      link: link
    };

    //---------------------

    function link(scope, element, attr) {
      scope.$watch('artist', function(artist) {
        //element.hide();
        lastfmFactory.artistInfo(artist).then(function(results) {
          //console.log(results.artist.image[scope.size]['#text']);
          try {
            var url = results.artist.image[scope.size]['#text'];
            if (url && url !== "") {
              element.attr('src', url);
            } else {
              throw new Error();
            }
          } catch(e) {
            switch (scope.size) {
              case '0':
              case '1':
                element.attr('src', '/img/no_img_avail_100.png');
                break;
              case '2':
              case '3':
                element.attr('src', '/img/no_img_avail_250.png');
              case '4':
                element.attr('src', '/img/no_img_avail_500.png');
            }
            //element.show();
          }
        });         
      });
    }
  }


})();