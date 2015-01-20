
(function () {
  
  angular.module('app')
    .factory('SearchRequestFactory', SearchRequest)
    .factory('SearchAlbumsFactory', SearchAlbums);



  /* Search Request Factory */

  function SearchRequest($http, $q) {

    return {
      getArtistSearch: getArtistSearch
    }

    ///////////////////////////////////////////////7

    function getArtistSearch(type, name) {
      console.log('Search Request: ', type, name);

      var deferred = $q.defer();

      $http.get('api/search/artist/' + type + '/' + name)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }

  }



  /* Search Albums from Artist */

  function SearchAlbums($http, $q) {

    return {
      getAlbums: getAlbums
    }

    ///////////////////////////////////////////////7

    function getAlbums(artistname) {
      var deferred = $q.defer();

      if (!artistname || artistname.length === 0) return deferred.reject(null);

      $http.get('api/search/albums/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }

  }


})();