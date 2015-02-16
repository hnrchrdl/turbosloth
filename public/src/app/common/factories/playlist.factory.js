(function(){ 'use strict';
  
  angular.module('app')
    .factory('PlaylistsFactory', PlaylistsFactory);
    
  function PlaylistsFactory($http, $q) {
    /* Queue Factory */
    
    return {
      getPlaylists: getPlaylists
    };

    ///////////////////////////////

    function getPLaylists(playlistname) {
      
      var playlistname = (typeof(playlistname) != 'undefined') ?
        playlistname :
        null;
      
      var deferred = $q.defer();
      
      if (playlistname) {
        var http = $http.get('/api/playlists/' + playlistname);
      } else {
        var http = $http.get('/api/playlists')
      }
      http
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }
  
})();
