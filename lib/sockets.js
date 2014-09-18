var socketio = require('socket.io'),
  cookie = require('cookie'),
  signature = require('cookie-signature'),
  redisClient = require('redis').createClient(6379, 'localhost'),
  komponist = require('./komponist');

var __socket;



var listen = function(app) {

  io = socketio.listen(app);
  
  io.sockets.on('connection', function (socket) {

    __socket = socket;
    //console.log('A socket connected');

    if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {

      var raw = cookie.parse(socket.handshake.headers.cookie)['express.sid'];
      if (raw) {
        // The cookie set by express-session begins with s: which indicates it
        // is a signed cookie. Remove the two characters before unsigning.
        socket.sessionID = signature.unsign(raw.slice(2), 'a4f8071f-c873-4447-8ee2') || undefined;
      }
    }

    if (socket.sessionID) {
      socket.on('mpd', function(cmd,args,callback) {

        var komponistClient = komponist.getClient(socket.sessionID);
        if (komponistClient) {
          //console.log(cmd + " - " + args);
          //redisClient.get('sessions:' + socket.sessionID, function(err, session) {
          //});
          komponistClient.command(cmd,args,function(err,msg) {

            if (err) {
              console.log('mpd-error: ' + err);
            }
            if (callback) {
              callback(err, msg);
            }
          });
        }
      });

      socket.on('get_streaming_status', function(callback) {

          redisClient.get('sessions:' + socket.sessionID, function(err,msg) {

            var msg = JSON.parse(msg);
            //console.log('get: ' + msg.streaming);
            callback(msg.streaming);
          });
      });

      socket.on('set_streaming_status', function(status) {

        //console.log('set: ' + status);
        redisClient.get('sessions:' + socket.sessionID, function(err,msg) {

          var msg = JSON.parse(msg);
          msg.streaming = status;
          redisClient.set('sessions:' + socket.sessionID, JSON.stringify(msg));
        });
      });
    }
    io.emitChange = function (system) {
      // sends the mpd system change to the browser
      // this is done when side is lodaed
      // or something on Mpd has happend
      socket.emit('change',system);
    }
  });
  return io;
}

module.exports = {
  listen: listen
}
