
(function () {
  
  //angular.module('app.factories', [])
  angular.module('app')
    .factory('QueueFactory', QueueFactory);



  /* Queue Factory */

  function QueueFactory($http, $q) {
    

    return {
      getQueue: getQueue
    };


    ///////////////////////////////


    function getQueue() {

      var deferred = $q.defer();
      
      $http.get( '/api/queue')
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      //deferred.promise.then(function(data) {
      //  data = data;
      //});

      return deferred.promise;
    }

  }
  

})();
