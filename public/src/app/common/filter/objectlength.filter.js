(function() { 'use strict';



  angular.module('app')
    .filter('objectlength', objectlength);

  function objectlength() {
    return function(input) {
      if(angular.isObject(input)) {
        return Object.keys(input).length;
      }
    }
  };


})();