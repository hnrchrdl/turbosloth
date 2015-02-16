(function() { 'use strict';
  
  angular.module('app')
    .factory('BrowseFactory', BrowseFactory);
    
  function BrowseFactory($http, $q) {
    
    return {
      browseFolder: browseFolder
    };
    
    /////////////////////////////////
    
    function browseFolder(folder) {
      
      var deferred = $q.defer();
      
      if (folder) {
        var http = $http.get('/api/browse/' + folder);
      }
      else {
        var http = $http.get('/api/browse');
      }
      
      http
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });
      
      return deferred.promise;
    }
    
  }
  
})();
