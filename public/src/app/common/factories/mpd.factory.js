
(function () {
  
  angular.module('app')
    .factory('MpdFactory', MpdFactory);


  /* Mpd Factory */

  function MpdFactory(MsgFactory, socket) {

    return {
      sendCommand: sendCommand,
      playSong: playSong,
      savePlaylist: savePlaylist,
      shufflePlaylist: shufflePlaylist,
      clearPlaylist: clearPlaylist,
      playNext: playNext,
      removeFromPlaylist: removeFromPlaylist,
      seekToTime: seekToTime,
      addSongs: addSongs,
      addSongsNext: addSongsNext,
      addSongsAndReplace: addSongsAndReplace
    };


    /////////////////////////////////

    function sendCommand(cmd, args) {
      socket.emitMpdCommand(cmd, args);
    }


    function playSong(id) {
      socket.emitMpdCommand('playid', [id]);
    }


    function savePlaylist(name) {
       socket.emitMpdCommand('save', [name]);
    }


    function shufflePlaylist() {
      socket.emitMpdCommand('shuffle');
    }


    function clearPlaylist() {
      socket.emitMpdCommand('clear');
    }


    function playNext(songs) {
      if (_.isArray(songs)) { // array of songs
        _.each(songs, function(song) {
          socket.emitMpdCommand('moveid', [song.Id, -1]);
        });
      }
    }


    function removeFromPlaylist(songs) {
      if (_.isArray(songs)) { // array of songs
        _.each(songs, function(song) { // iterate selection
          socket.emitMpdCommand('deleteid', [song.Id]); // remove
        });
      }
    }

    function seekToTime(time) {
      socket.emitMpdCommand('seekcur', [time]);
    }


    function addSongs(songs) {
      var cmd = 'add';
      if (_.isArray(songs)) { // array of songs
        _.each(songs, function(song) {
          var args = song.file
          socket.emitMpdCommand(cmd, [args]);
        });
      } else { // just one song
        var args = songs.file
        socket.emitMpdCommand(cmd, [args]);
      }
    }


    function addSongsAndReplace(songs) {
      socket.emitMpdCommand('clear', [], function() {
        addSongs(songs);
      });
    }

    function addSongsNext(songs) {

    }

  }



})();