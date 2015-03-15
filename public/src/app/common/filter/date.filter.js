(function() { 'use strict';
  
  angular.module('app')
    .filter('date', date);


  function date() {
    return function(input) {
      var parsed = new Date(input);
      return parsed.toDateString() + ' (' + parsed.toLocaleTimeString() + ')';
    }
  }

})();