(function(){ 'use strict';
  
  angular.module('app')
    .factory('PlaylistFactory', PlaylistFactory);
    
  function PlaylistFactory($http, $q) {
    /* Queue Factory */
    
    return {
      getPlaylist: getPlaylist
    };

    ///////////////////////////////

    function getPlaylist(playlistname) {
      
      var playlistname = (typeof(playlistname) != 'undefined') ?
        playlistname :
        null;
      
      var deferred = $q.defer();
      
      if (playlistname) {
        var http = $http.get('/api/playlists/' + playlistname);
      } else {
        var http = $http.get('/api/playlists');
      }
      http
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }
  }
  
})();
