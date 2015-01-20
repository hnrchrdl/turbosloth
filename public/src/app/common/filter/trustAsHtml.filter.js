(function() { 'use strict';



  angular.module('app')
    .filter('trustAsHtml', trustAsHtml);

  function trustAsHtml($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    }
  };


})();