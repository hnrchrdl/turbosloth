(function() { 'use strict';

  angular.module('app')
    .directive('mpd', mpdCommandDirective);
    
  /////////////////////////////////////
  
  
  function mpdCommandDirective($rootScope) {
    return {
      restrict: 'A',
      scope: {
        boundTo: '@bind',
        cmd: '@cmd',
        args: '=args'
      },
      controller: mpdCommandDrctController,
      link: link
    };
    
    //---------------------
    
    function mpdCommandDrctController($scope, socket) {
      $scope.mpdCommands = {
        
        play: function() {
          socket.emitMpdCommand({cmd: 'play', args: []}, handleMsg);
        },
        
        playSong:  function(id) {
          socket.emitMpdCommand({cmd: 'playid', args: [id]}, handleMsg);
        },
        
        playNext: function(songs) {
          var commandList = [];
          console.log(songs);
          if (_.isArray(songs)) { // array of songs
            songs.reverse();
            _.each(songs, function(song) {
              commandList.push({cmd: 'moveid', args: [song.Id, -1]});
            });
            
          } else {
            var song = songs; // just one song
            commandList.push({cmd: 'moveid', args: [song.Id, -1]});
          }
          socket.emitMpdCommand(commandList, handleMsg);
        },
        
        stop: function() {
         socket.emitMpdCommand({cmd: 'stop', args: []}, handleMsg);
        },
        
        previous: function() {
          socket.emitMpdCommand({cmd: 'previous', args: []}, handleMsg);
        },
        
        next: function() {
          socket.emitMpdCommand({cmd: 'next', args: []}, handleMsg);
        },
        
        pause: function() {
          socket.emitMpdCommand({cmd: 'pause', args: [1]}, handleMsg);
        },
        
        savePlaylist: function(name) {
          socket.emitMpdCommand({cmd: 'save', args: [name]}, handleMsg);
        },
        
        shuffleQueue: function() {
          socket.emitMpdCommand({cmd: 'shuffle', args: []}, handleMsg);
        },
        
        removeFromQueue: function(songs) {
          if (_.isArray(songs)) { // array of songs
            var commandList = [];
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'Id')) {
                commandList.push({cmd: 'deleteid', args: [song.Id]}); // remove
              }
            });
            socket.emitMpdCommand(commandList, handleMsg);
          } else {
            var song = songs; //just one song
            if (_.has(song, 'Id')) {
              socket.emitMpdCommand({cmd: 'deleteid', args: [song.Id]}, handleMsg); // remove
            }
          }
        },
        
        clearQueue: function () {
          socket.emitMpdCommand({cmd: 'clear', args: []}, handleMsg);
        },
        
        toggleRandom: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          console.log('setRandomTo: ', newStatus);
          socket.emitMpdCommand({cmd: 'random', args: [newStatus]}, handleMsg);
        },
        
        toggleRepeat: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          socket.emitMpdCommand({cmd: 'repeat', args: [newStatus]}, handleMsg);
        },
        
        // adds a list of songs to the queue
        addSongsToQueue: function(songs) {
          if (_.isArray(songs)) { // array of songs
            var commandList = [];
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file')) {
                commandList.push({cmd: 'add', args: [song.file]}, handleMsg); // add song
              }
            });
          } else {
            var song = songs; //just one song
            if (_.has(song, 'file')) {
              socket.emitMpdCommand({cmd: 'deleteid', args: [song.Id]}, handleMsg); // remove
            }
          }
        },
        
        addSongsToQueueNext: function(songs) {
          var commandList = [];
          if (_.isArray(songs)) { // array of songs
            songs.reverse(); // reverse the order of songs
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file') && _.has(song, 'Id')) {
                commandList.push({cmd: 'add', args: [song.file]}); // add song
                commandList.push({cmd: 'moveid', args: [song.Id, -1]}); // move to next
              }
            });
          } else {
            var song = songs; //just one song
            if (_.has(song, 'file') && _.has(song, 'Id')) {
              commandList.push({cmd: 'add', args: [song.file]}); // add song
              commandList.push({cmd: 'moveid', args: [song.Id, -1]}); // move to next
            }
          }
          socket.emit('mpd', commandList, handleMsg);
        },
        
        playSongs: function(songs) {
          var commandList = [];
          commandList.push({cmd: 'clear', args: []}); //clear playlist
          if (_.isArray(songs)) { // array of songs
            songs.reverse(); // reverse the order of songs
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file')) {
                commandList.push({cmd: 'add', args: [song.file]}); // add song
              }
            });
          } else {
            var song = songs; //just one song
            if (_.has(song, 'file')) {
              commandList({cmd: 'add', args: [song.file]}); // add song
            }
          }
          commandList.push({cmd: 'play', args: []});
          socket.emit('mpd', commandList, handleMsg);
        },
        
        addAllFromArtists: function(artists) {
          var commandList = [];
          if (_.isArray(artists)) { // array of artists
            _.each(artists, function(artist) {
              if (_.isObject(artist) && _.has(artist, 'name')) {
                var artistname = artist.name;
              } else if (_.isString(artist)) {
                var artistname = artist;
              }
              commandList.push({cmd: 'findadd', args: [artistname]}); // add song
            });
          } else {
            var artist = artists; //only 1 artist to findadd
            if (_.isObject(artist) && _.has(artist, 'name')) {
              var artistname = artist.name;
            } else if (_.isString(artist)) {
              var artistname = artist;
            }
            commandList.push({cmd: 'findadd', args: [artistname]}); // add song
          }
          socket.emit('mpd', commandList, handleMsg);
        },

        playAllFromArtists: function(artists) {
          var commandList = [];
          commandList.push({cmd: 'clear', args: []}); //clear playlist
          if (_.isArray(artists)) { // array of artists
            _.each(artists, function(artist) {
              if (_.isObject(artist) && _.has(artist, 'name')) {
                var artistname = artist.name;
              } else if (_.isString(artist)) {
                var artistname = artist;
              }
              commandList.push({cmd: 'findadd', args: [artistname]}); // add song
            });
          } else {
            var artist = artists; //only 1 artist to findadd
            if (_.isObject(artist) && _.has(artist, 'name')) {
              var artistname = artist.name;
            } else if (_.isString(artist)) {
              var artistname = artist;
            }
            commandList.push({cmd: 'findadd', args: [artistname]}); // add song
          }
          commandList.push({cmd: 'play', args: []});
          socket.emit('mpd', commandList, handleMsg);
        },

        seekToTime: function(time) {
          socket.emitMpdCommand({cmd: 'seekcur', args: [time]}, handleMsg);
        }

      };
    }
    
    function link(scope, element) {

      element.bind(scope.boundTo || 'click', function() {
        if (scope.argsfunc) {
          //console.log(scope.argsfunc());
        }
        console.log('execute: ', scope.cmd, scope.args);
        scope.mpdCommands[scope.cmd](scope.args || null);
      });

      scope.$on('mpdCommand', function(e, options) {
        console.log('execute: ', options.cmd, options.args);
        scope.mpdCommands[options.cmd](options.args || null);
      });
    }
    
    function handleMsg(err, msg) {
      if (_.has(msg, 'changed'), function() {
        var changed = msg.changed;
        console.log(changed);
      });
      console.log('handle mpd command msg: ', err, msg);
    }
  }



})();
