(function() { 'use strict';
  
  angular.module('app')
    .filter('urlencode', urlencode);


  function urlencode() {
    return function(input) {
      return encodeURIComponent(input);
    }
  }

})();