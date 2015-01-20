(function() {
  
  angular.module('app')
    .factory('ArtistInfoFactory', ArtistInfoFactory);

  /* Artist Info Factory */


  function ArtistInfoFactory($http, $q) {
    
    return {
      getArtistInfo: getArtistInfo
    }

    ///////////////////////////////////////////

    function getArtistInfo(artistname) {
      var deferred = $q.defer();
      console.log('ArtistInfoRequest', artistname);
      $http.get('/api/lastfm/artist/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }

  }




})();