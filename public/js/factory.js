
(function () {
  
  angular.module('app.factories', [])
    .factory('MpdFactory', MpdFactory)
    .factory('QueueFactory', QueueFactory)
    .factory('SearchRequestFactory', SearchRequestFactory)
    .factory('MsgFactory', MsgFactory);



  /* Mpd Factory */

  MpdFactory.$inject = ['MsgFactory']

  function MpdFactory(MsgFactory) {

    return {
      emitCommand: emitCommand
    };

    ///////////////////////////////

    function emitCommand(cmd, args, cb) {
      var cmd = cmd;
      var args = args || [];
      socket.emit('mpd', cmd, args, function(err, msg) {
        console.log(err, msg);
        if (err) MsgFactory.error(201);
        else MsgFactory.info(101);
        return cb ? cb(err, msg) : true;
      });
    }
  }



  /* Message Factory */

  function MsgFactory() {
    return {
      error: error,
      info: info 
    };

    ////////////////////////////////

    function error(code) {
      console.log(code);
    }

    function info(code) {
      console.log(code);
    }
  }



  /* Queue Factory */

  QueueFactory.$inject = ['$http', '$q'];

  function QueueFactory($http, $q) {

    return {
      getPromise: getPromise
    };

    ///////////////////////////////

    function getPromise() {
      var deferred = $q.defer();
      
      $http.get( '/api/queue')
        .success(function(data) { deferred.resolve(data); })
        .error(function(data) { deferred.reject(data); });

      return deferred.promise;
    }

  }
  


  /* Search Request Factory */

  SearchRequestFactory.$inject = ['$http', '$q'];

  function SearchRequestFactory($http, $q) {

    return {
      getPromise: getPromise
    }

    ///////////////////////////////////////////////7

    function getPromise(params) {
      var deferred = $q.defer();

      $http.get('api/search', { params: params })
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(data); });

      return deferred.promise;
    }

  }




})();