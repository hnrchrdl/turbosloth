(function() { 'use strict';

  angular.module('app')
    .directive('mpd', mpdCommandDirective);
    
  /////////////////////////////////////
  
  
  function mpdCommandDirective() {
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
          socket.emitMpdCommand('play', [], handleMsg);
        },
        playSong:  function(id) {
          socket.emitMpdCommand('playid', [id], handleMsg);
        },
        playNext: function(songs) {
          if (_.isArray(songs)) { // array of songs
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            _.each(songs, function(song) {
               socket.emitMpdCommand('moveid', [song.Id, -1], handleMsg);
            });
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var song = songs; // just one song
            socket.emitMpdCommand('moveid', [song.Id, -1], handleMsg);
          }
        },
        stop: function() {
         socket.emitMpdCommand('stop',[], handleMsg);
        },
        previous: function() {
          socket.emitMpdCommand('previous', [], handleMsg);
        },
        next: function() {
          socket.emitMpdCommand('next', [], handleMsg);
        },
        pause: function() {
          socket.emitMpdCommand('pause', [1], handleMsg);
        },
        savePlaylist: function(name) {
          socket.emitMpdCommand('save', [name], handleMsg);
        },
        shuffleQueue: function() {
          socket.emitMpdCommand('shuffle', [], handleMsg);
        },
        removeFromQueue: function(songs) {
          if (_.isArray(songs)) { // array of songs
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'Id')) {
                socket.emitMpdCommand('deleteid', [song.Id], handleMsg); // remove
              }
            });
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var song = songs; //just one song
            if (_.has(song, 'Id')) {
              socket.emitMpdCommand('deleteid', [song.Id], handleMsg); // remove
            }
          }
        },
        clearQueue: function () {
          socket.emitMpdCommand('clear', [], handleMsg);
        },
        toggleRandom: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          socket.emitMpdCommand('repeat', [newStatus], handleMsg);
        },
        toggleRepeat: function(status) {
          var newStatus = 1 - parseInt(status); // set to opposite
          socket.emitMpdCommand('random', [newStatus], handleMsg);
        },
        // adds a list of songs to the queue
        addSongsToQueue: function(songs) {
          if (_.isArray(songs)) { // array of songs
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file')) {
                socket.emitMpdCommand('add', [song.file], handleMsg); // add song
              }
            });
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var song = songs; //just one song
            if (_.has(song, 'file')) {
              socket.emitMpdCommand('deleteid', [song.Id], handleMsg); // remove
            }
          }
        },
        addSongsToQueueNext: function(songs) {
          if (_.isArray(songs)) { // array of songs
            songs.reverse(); // reverse the order of songs
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file') && _.has(song, 'Id')) {
                socket.emitMpdCommand('add', [song.file], handleMsg); // add song
                socket.emitMpdCommand('moveid', [song.Id, -1], handleMsg); // move to next
              }
            });
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var song = songs; //just one song
            if (_.has(song, 'file') && _.has(song, 'Id')) {
              socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
              socket.emitMpdCommand('add', [song.file], handleMsg); // add song
              socket.emitMpdCommand('moveid', [song.Id], handleMsg); // move to next
              socket.emitMpdCommand('command_list_end', [], handleMsg);
            }
          }
        },
        playSongs: function(songs) {
          if (_.isArray(songs)) { // array of songs
            songs.reverse(); // reverse the order of songs
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            socket.emitMpdCommand('clear', [], handleMsg); //clear playlist
            _.each(songs, function(song) { // iterate selection
              if (_.has(song, 'file')) {
                socket.emitMpdCommand('add', [song.file], handleMsg); // add song
              }
            });
            socket.emitMpdCommand('play', [], handleMsg);
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var song = songs; //just one song
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            socket.emitMpdCommand('clear', [], handleMsg); //clear playlist
            if (_.has(song, 'file')) {
              socket.emitMpdCommand('add', [song.file], handleMsg); // add song
            }
            socket.emitMpdCommand('play', [], handleMsg);
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          }
        },
        addAllFromArtists: function(artists) {
          if (_.isArray(artists)) { // array of artists
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            _.each(artists, function(artist) {
              if (_.isObject(artist) && _.has(artist, 'name')) {
                socket.emitMpdCommand('findadd', [artist.name], handleMsg); // add song
              } else if (_.isString(artist)) {
                socket.emitMpdCommand('findadd', [artist], handleMsg); // add song
              }
            });
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var artist = artists; //only 1 artist to findadd
            if (_.isObject(artist) && _.has(artist, 'name')) {
                socket.emitMpdCommand('findadd', [artist.name], handleMsg); // add song
              } else if (_.isString(artist)) {
                socket.emitMpdCommand('findadd', [artist], handleMsg); // add song
              }
          }
        },
        playAllFromArtists: function(artists) {
          if (_.isArray(artists)) { // array of artists
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            socket.emitMpdCommand('clear', [], handleMsg); //clear playlist
            _.each(artists, function(artist) {
              if (_.isObject(artist) && _.has(artist, 'name')) {
                socket.emitMpdCommand('findadd', [artist.name], handleMsg); // add song
              } else if (_.isString(artist)) {
                socket.emitMpdCommand('findadd', [artist], handleMsg); // add song
              }
            });
            socket.emitMpdCommand('play', [], handleMsg);
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          } else {
            var artist = artists; //only 1 artist to findadd
            socket.emitMpdCommand('command_list_ok_begin', [], handleMsg);
            socket.emitMpdCommand('clear', [], handleMsg); //clear playlist
            if (_.isObject(artist) && _.has(artist, 'name')) {
              socket.emitMpdCommand('findadd', [artist.name], handleMsg); // add song
            } else if (_.isString(artist)) {
              socket.emitMpdCommand('findadd', [artist], handleMsg); // add song
            }
            socket.emitMpdCommand('play', [], handleMsg);
            socket.emitMpdCommand('command_list_end', [], handleMsg);
          }
        },
      }
    }
    
    function link(scope, element) {
      element.bind(scope.boundTo, function() {
        console.log('execute: ', cmd, args);
        scope.mpdCommands[scope.cmd](scope.args); // execute command
      });
    }
    
    function handleMsg(msg) {
      console.log(msg);
    }
    
  }



})();
