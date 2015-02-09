(function() {
  

  angular.module('app')
    .factory('lastfmFactory', lastfmFactory);
    //.factory('ArtistInfoFactory', ArtistInfoFactory)
    //.factory('TopAlbumsFactory', TopAlbumsFactory)
    //.factory('SimilarArtistsFactory', SimilarArtistsFactory)
    //.factory('AlbumInfoFactory', AlbumInfoFactory);



  //////////////////////////////////////////


  /* Artist Info Factory */
  function lastfmFactory($http, $q) {
    
     return {
      artistInfo: artistInfo,
      albumInfo: albumInfo,
      topAlbums: topAlbums,
      similarArtists: similarArtists
    };
    
    //-------------------------------------
  
    function artistInfo(artistname) {

      var deferred = $q.defer();
      
      $http.get('/api/lastfm/artist/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  

   //-------------------------------------

    function albumInfo(artist, album) {
      
      var deferred = $q.defer();
      
      $http.get('/api/lastfm/album/' + artist + '/' + album)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }


    //---------------------------------

    function topAlbums(artistname) {
      
      var deferred = $q.defer();
      
      $http.get('/api/lastfm/topalbums/' + artistname + '/50')
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  

    //-----------------------

    function similarArtists(artistname) {
      
      var deferred = $q.defer();
      
      $http.get('/api/lastfm/similar/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }




})();
