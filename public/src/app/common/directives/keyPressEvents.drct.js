
(function() { 'use strict';

  angular.module('app')
    .directive('keypressEvents', KeyPressDirective);


  
  function KeyPressDirective($document, $rootScope) {
    return {
      restrict: 'A',
      link: link
    };

    function link() {
      $document
        .bind('keydown', keydown)
        .bind('keypress', keypress);

      function keydown(e) {
        console.log('Got keydown:', e.which);
        $rootScope.$broadcast('keydown:' + e.which, e);
      };

      function keypress(e) {
        console.log('Got keypress:', e.which);
        $rootScope.$broadcast('keypress:' + e.which, e);
      };
    }

  }


})();
