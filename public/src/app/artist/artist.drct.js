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

        scope.artistinfo = null;
        scope.joinedAlbums = null;
        scope.similarArtists = null;

        if (artistname) {

          //console.log(artistname);
          
          //scope.artistinfo.name = artistname;

          lastfmFactory.artistInfo(artistname).then(function(results) {

            scope.artistinfo = results.artist;
            scope.artistinfo.name = artistname;

            try {
              scope.artistinfo.imageurl = results.artist.image[4]['#text'];
            } catch(e) {
              scope.artistinfo.imageurl = '/img/no_img_avail_500.png';
            }

          }, function(reason) { //failure
            console.log('failed to get artist info: ', reason);
            scope.artistinfo = {
              name: artistname
            };
          });


          SearchFactory.getJoinedAlbums(artistname).then(function(results) {
            scope.joinedAlbums = results;
          }, function(reason) {
            console.log('failed to get albums: ', reason);
            scope.joinedAlbums = [];
          });
          

          lastfmFactory.similarArtists(artistname).then(function(results) {
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
            }, function(reason) { //failure
              console.log('failed to get similar artists: ', reason);
              scope.similarArtists = [];
            });
            scope.similarArtists = similarArtists;
          });
        
        }

      });

    }

  }

})();
