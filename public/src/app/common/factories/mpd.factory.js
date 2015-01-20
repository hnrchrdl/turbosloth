
(function () {
  
  //angular.module('app.factories', [])
  angular.module('app')
    .factory('MpdFactory', MpdFactory);



  /* Mpd Factory */

  function MpdFactory(MsgFactory) {

    return {
      emitCommand: emitCommand
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
  }



})();