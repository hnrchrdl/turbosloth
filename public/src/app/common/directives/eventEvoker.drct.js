(function(){

  angular.module('app')
    .directive('eventEvoker', eventEvoker);

  function eventEvoker($rootScope) {

    return {
      restrict: 'A',
      scope: {
        eventname: '@'
      },
      link: link
    };

    //-----------------

    function link(scope, element) {
      element.on('click', function() {
        console.log('eventEvoked: ', scope.eventname);
        $rootScope.$broadcast(scope.eventname);
      });
    }
  }

})();