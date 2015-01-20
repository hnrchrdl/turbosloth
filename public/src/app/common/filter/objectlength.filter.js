(function() { 'use strict';



  angular.module('app')
    .filter('objectlength', objectlength);

  function objectlength() {
    return function(input) {
      console.log(input);
      if(angular.isObject(input)) {
        return Object.keys(input).length;
      }
    }
  };


})();