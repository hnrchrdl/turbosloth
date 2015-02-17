(function() { 'use strict';
  
  angular.module('app')
    .directive('artistDirective', artistDirective);

  ///////////////////////////////////////

  function artistDirective(SearchFactory, lastfmFactory) {

    return {
      restrict: 'E',
      scope: {
        artistname: '='
      },
      templateUrl: 'search/artist/search.artist.partial.html',
      link: link
    };

    //---------------------

    function link(scope, element, attr) {

      scope.$watch('artistname', function(artistname) {

        if (artistname) {

          scope.artistinfo = {};
          
          scope.artistinfo.name = artistname;

          lastfmFactory.artistInfo(artistname)
          .then(function(results) {
            scope.artistinfo = results.artist;
            scope.artistinfo.imageurl = results.artist.image[4]['#text'];
          });

          lastfmFactory.similarArtists(artistname)
          .then(function(results) {
            var similarArtists = [];
            _.each(results.similarartists.artist, function(artist) {
              similarArtists.push({
                name: artist.name,
                imageUrl: artist.image[3]['#text']
              });
            });
            scope.similarArtists = similarArtists;
          });

          SearchFactory.getJoinedAlbums(artistname)
          .then(function(results) {
            scope.joinedAlbums = results;
          });
        
        }

      });

    }

  }

})();
