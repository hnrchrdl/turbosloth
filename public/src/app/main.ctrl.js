(function() { 'use strict';


  angular.module('app')
    .controller( 'MainController', MainController);


  /**
  *** Main Controller
  *** main app controller for routing
  *** $scope.main represents the current route
  **/
  function MainController($rootScope, $location, MpdFactory) {

    var vm = this;

    $rootScope.setLocation = setLocation;

    vm.cmd = {
      play: play,
      stop: stop,
      previous: previous,
      next: next,
      pause: pause,
      toggleRandom: toggleRandom,
      toggleRepeat: toggleRepeat,
      toggleStream: toggleStream
    };

    function play (argument) {
      MpdFactory.sendCommand('play');
    }

    function stop (argument) {
      MpdFactory.sendCommand('stop');
    }

    function previous (argument) {
      MpdFactory.sendCommand('previous');
    }

    function next (argument) {
      MpdFactory.sendCommand('next');
    }

    function pause (argument) {
      MpdFactory.sendCommand('pause', [1]);
    }

    function toggleStream() {
      // body...
    }

    function toggleRepeat(status) {
      var newStatus = 1 - parseInt(status); // set to opposite
      MpdFactory.sendCommand('repeat', [newStatus]);
    }

    function toggleRandom(status) {
      var newStatus = 1 - parseInt(status); // set to opposite
      MpdFactory.sendCommand('random', [newStatus]);
    }


    function setLocation(location) {
      if (location) {
        console.log('set location: ', location);
        $location.path(location);
      }
    }






  }


})();