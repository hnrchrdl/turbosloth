
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

      var deferred = $q.defer();

      $http.get('api/search/artist/' + type + '/' + name)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }

  }



  /* Search Albums from Artist */

  function SearchAlbums($http, $q, TopAlbumsFactory) {

    return {
      getAlbums: getAlbums,
      getAlbumsPro: getAlbumsPro,
      getJoinedAlbums: getJoinedAlbums
    };

    ///////////////////////////////////////////////7

    function getAlbums(artistname) {
      var deferred = $q.defer();

      if (!artistname || artistname.length === 0) return deferred.reject(null);

      $http.get('api/search/albums/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }


    function getAlbumsPro(artistname) {
      //var deferred = $q.defer();

      if (!artistname || artistname.length === 0) return deferred.reject(null);

      var promises = [SearchAlbumsFactory.getAlbums];

      return $q.all(promises);
    }


    function getJoinedAlbums(artistname) {
      var deferred = $q.defer();

      $q.all([
        getAlbums(artistname),
        TopAlbumsFactory.getAlbums(artistname)
      ]).then(function(results) {
        var joined = [];
        var albums = results[0].albums;
        var topalbums = results[1].topalbums.album;
        // top albums
        _.each(topalbums,function(topalbum) {
          topalbum.imageUrl = topalbum.image[3]['#text'];
          var topalbumname = topalbum.name.toLowerCase();
          if (_.has(albums, topalbumname)) {
            topalbum.songs = albums[topalbumname];
            topalbum.inDatabase = true;
            delete albums[topalbumname];
          } else {
            topalbum.songs = null;
            topalbum.inDatabase = false;
          }
          joined.push(topalbum);
        });
        //other albums
        _.each(albums, function(album, key) {
          if (key) {
            joined.push({
              name: key,
              songs: album,
              inDatabase: true,
              imageUrl: 'http://static.last.fm/flatness/catalogue/noimage/noalbum_g3.png'
            });
          }
        });
        deferred.resolve(joined);
      });

      return deferred.promise;
    }

  }

})();