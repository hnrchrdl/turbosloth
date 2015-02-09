
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
        $rootScope.$broadcast('keydown:' + e.which, e);
      };

      function keypress(e) {
        $rootScope.$broadcast('keypress:' + e.which, e);
      };
    }

  }


})();
