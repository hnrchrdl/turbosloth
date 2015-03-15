(function() { 'use strict';



  angular.module('app')
    .filter('urlEncode', urlEncode);

  function urlEncode() {
    return function(input) {
      if(angular.isString(input)) {
        return encodeURIComponent(input);
      }
    }
  };


})();