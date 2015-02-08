(function() {
  

  angular.module('app')
    .factory('ArtistInfoFactory', ArtistInfoFactory)
    .factory('TopAlbumsFactory', TopAlbumsFactory)
    .factory('SimilarArtistsFactory', SimilarArtistsFactory)
    .factory('AlbumInfoFactory', AlbumInfoFactory);



  //////////////////////////////////////////


  /* Artist Info Factory */

  function ArtistInfoFactory($http, $q) {
    
    return {
      getArtistInfo: getArtistInfo
    };

    //----------------------

    function getArtistInfo(artistname) {
      console.log('ArtistInfoRequest: ', artistname);

      var deferred = $q.defer();
      
      $http.get('/api/lastfm/artist/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }

  function AlbumInfoFactory($http, $q) {

    return {
      getDetails: getDetails
    };

    ///////////////////////////////////

    function getDetails(artist, album) {
      
      console.log('AlbumInfoRequest: ', artist, album);

      var deferred = $q.defer();
      
      $http.get('/api/lastfm/album/' + artist + '/' + album)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }



  /* Artist Info Factory */

  function TopAlbumsFactory($http, $q) {
    
    return {
      getAlbums: getAlbums
    };

    //-----------------------

    function getAlbums(artistname) {
      console.log('TopAlbumsRequest: ', artistname);
      
      var deferred = $q.defer();
      
      $http.get('/api/lastfm/topalbums/' + artistname + '/50')
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }



  /* Artist Info Factory */

  function SimilarArtistsFactory($http, $q) {
    
    return {
      getArtists: getArtists
    };

    //-----------------------

    function getArtists(artistname) {
      console.log('SimilarArtistsRequest: ', artistname);
      
      var deferred = $q.defer();
      
      $http.get('/api/lastfm/similar/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }




})();