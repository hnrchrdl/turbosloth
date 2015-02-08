(function() {
  

  angular.module('app')
    .factory('CurrentSong', CurrentSongFactory);

  
  ///////////////////////////////


  function CurrentSongFactory($http, $q) {

      return {
        getSongAndStatus: getSongAndStatus
      };

      //------------------

      function getSongAndStatus() {
        var deferred = $q.defer();

        $q.all([
          getStatus(),
          getSong()
        ]).then(function(results) {
          deferred.resolve(results);
        });

        return deferred.promise;
      }


      function getStatus() {
        var deferred = $q.defer();

        $http.get('api/mpd/status')
          .success(function(results) { deferred.resolve(results); })
          .error(function(err) { deferred.reject(err); });

        return deferred.promise;
      }


      function getSong() {
        var deferred = $q.defer();

        $http.get('api/mpd/song')
          .success(function(results) { deferred.resolve(results); })
          .error(function(err) { deferred.reject(err); });

        return deferred.promise;
      }

    }  


})();