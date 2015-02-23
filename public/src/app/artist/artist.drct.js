(function() { 'use strict';
  
  angular.module('app')
    .directive('showArtistDirective', showArtistDirective);

  ///////////////////////////////////////

  function showArtistDirective(SearchFactory, lastfmFactory) {

    return {
      restrict: 'E',
      scope: {
        artistname: '='
      },
      templateUrl: 'artist/artist.partial.html',
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
            try {
              scope.artistinfo.imageurl = results.artist.image[4]['#text'];
            } catch(e) {
              console.log('no artist image with size 4!');
            }
          });

          lastfmFactory.similarArtists(artistname)
          .then(function(results) {
            var similarArtists = [];
            _.each(results.similarartists.artist, function(artist) {
              try {
                similarArtists.push({
                  name: artist.name,
                  imageUrl: artist.image[3]['#text']
                });
              } catch(e) {
                console.log('failed to get artist image for ' + artist.name);
              }
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
