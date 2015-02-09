(function() { 'use strict';
  
  angular.module('app')
    .directive('searchArtistDirective', searchArtistDirective);

  ///////////////////////////////////////

  function searchArtistDirective(
          ArtistInfoFactory
        , SearchAlbumsFactory
        , TopAlbumsFactory
        , SimilarArtistsFactory) {

    return {
      restrict: 'E',
      scope: {
        artist: '=artist'
      },
      templateUrl: 'search/artist/search.artist.partial.html',
      link: link
    };

    //---------------------

    function link(scope, element, attr) {

      scope.$watch('artist', function(artist) {

        if (artist) {

          scope.artistinfo = {};
          
          scope.artistinfo.name = artist;

          ArtistInfoFactory.getArtistInfo(artist)
          .then(function(results) {
            scope.artistinfo = results.artist;
            scope.artistinfo.imageurl = results.artist.image[4]['#text'];
          });

          SimilarArtistsFactory.getArtists(artist)
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

          SearchAlbumsFactory.getJoinedAlbums(artist)
          .then(function(results) {
            scope.joinedAlbums = results;
          });
        
        }

      });

    }

  }

})();