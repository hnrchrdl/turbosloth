(function() { 'use strict';
  
  angular.module('app')
    .filter('plusOne', plusOne);


  function plusOne() {
    return function(input) {
      try {
        return parseInt(input) + 1;
      } catch(e) {
        return "";
      }
    }
  }

})();