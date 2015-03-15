(function() { 'use strict';



  angular.module('app')
    .filter('browseItem', browseItem);

  function browseItem() {
    return function(input) {
      if(angular.isString(input)) {
        var splitinput = input.split('/');
        return splitinput[splitinput.length-1];
      }
    }
  };


})();