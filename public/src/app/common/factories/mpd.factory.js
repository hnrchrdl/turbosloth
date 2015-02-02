
(function () {
  
  angular.module('app')
    .factory('MpdFactory', MpdFactory);



  /* Mpd Factory */

  function MpdFactory(MsgFactory) {

    return {
      emitCommand: emitCommand,
      addAlbumToQueue: addAlbumToQueue,
      addAlbumsToQueue: addAlbumsToQueue
    };

    ///////////////////////////////

    function emitCommand(cmd, args, cb) {
      console.log('emitting Mpd Command: ' + cmd + ': ' + args);
      var cmd = cmd;
      var args = args || [];
      socket.emit('mpd', cmd, args, function(err, msg) {
        if (err) MsgFactory.error(201);
        else MsgFactory.info(101);
        return cb ? cb(err, msg) : true;
      });
    }

    function addAlbumToQueue(songs) {
      if (_.isArray(songs)) {
        _.each(songs, function(song) {
          emitCommand('add', [song.file]);
        });
      }
    }

    function addAlbumsToQueue(albums) {
      _.each(albums, function(album) {
        addAlbumToQueue(album);
      });
    }


  }



})();