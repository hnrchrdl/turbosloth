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
      toggleStream: toggleStream,
      addAllFromArtists: addAllFromArtists,
      playAllFromArtists: playAllFromArtists,
      addAllFromAlbums: addAllFromAlbums,
      playAllFromAlbums: playAllFromAlbums
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
    
    function addAllFromArtists(artists) {
      console.log('this should add artists ', artists);
    }
    
    function playAllFromArtists(artists) {
      console.log('this should add and replace artists: '. artists);
    }
    
    function addAllFromAlbums(albums) {
      console.log('this should add albums: ', albums);
    }
    
    function playAllFromAlbums(albums) {
      console.log('this should add and replace albums: ', albums);
    }
    
    function addSongs(songs) {
      console.log('this should add song(s): ', songs);
    }


    function setLocation(location) {
      if (location) {
        console.log('set location: ', location);
        $location.path(location);
      }
    }






  }


})();
