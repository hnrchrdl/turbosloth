(function() { 'use strict';

  angular.module('app')
    .directive('mpdCommand', mpdCommandDirective);
    
  /////////////////////////////////////
  
  
  function mpdCommandDirective() {
    return {
      restrict: 'A',
      scope: {
        cmd: '@',
        args: '='
      },
      controller: mpdCommandDrctController,
      link: link
    };
    
    //---------------------
    
    function mpdCommandDrctController($scope, MpdFactory) {
      $scope.mpdCommands = {
        play: function() {
          MpdFactory.sendCommand('play');
        },
        stop: function() {
          MpdFactory.sendCommand('stop');
        },
        previous: function() {
          MpdFactory.sendCommand('previous');
        },
        next: function() {
          MpdFactory.sendCommand('next');
        },
        pause: function() {
          MpdFactory.sendCommand('pause', [1]);
        },
        toggleRandom: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          MpdFactory.sendCommand('repeat', [newStatus]);
        },
        toggleRepeat: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          MpdFactory.sendCommand('random', [newStatus]);
        },
        addSongs: function(songs) {
          console.log('this should add songs ', songs);
        },
        addSongsNext: function(songs) {
          console.log('this should add songs ', songs);
        },
        playSongs: function(songs) {
          console.log('this should play songs ', songs);
        },
        addAllFromArtists: function(artists) {
          console.log('this should add artists ', artists);
        },
        playAllFromArtists: function(artists) {
          console.log('this should add and replace artists: '. artists);
        },
      }
    }
    
    function link(scope, element) {
      element.bind('click', function() {
        console.log('execute: ', cmd, args);
        scope.mpdCommands[scope.cmd](scope.args); // execute command
      });
    }
  }



})();
