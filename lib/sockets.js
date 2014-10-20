var socketio = require('socket.io'),
  redisAdapter = require('socket.io-redis'),
  cookie = require('cookie'),
  signature = require('cookie-signature'),
  redis = require('redis'),
  komponist = require('./komponist'),
  var config = require('../app').config; // import config

// create a redisClient from config settings
var redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);

module.exports.listen = function(app) {

  var io = socketio.listen(app); //init io
  
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 })); // use io with redis

  // handle socket connection
  io.sockets.on('connection', function (socket) {
    console.log('A socket connected');
    
    if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
      var raw = cookie.parse(socket.handshake.headers.cookie)['express.sid'];
      if (raw) {
        // The cookie set by express-session begins with s: which indicates it
        // is a signed cookie. Remove the two characters before unsigning.
        socket.sessionID = signature.unsign(raw.slice(2), 'a4f8071f-c873-4447-8ee2') || undefined;
      }
    }

    if (socket.sessionID) {
      socket.join(socket.handshake.sessionID);
      // handle mpd event
      socket.on('mpd', function(cmd,args,callback) {
        var komponistClient = komponist.getClient(socket.sessionID);
        if (komponistClient) {
          komponistClient.command(cmd,args,function(err,msg) {
            if (err) { console.log('mpd-error: ' + err); }
            if (callback) { callback(err, msg); }
          });
        }
      });
      // handle get_streaming_status event
      socket.on('get_streaming_status', function(callback) {
          redisClient.get('sessions:' + socket.sessionID, function(err,msg) {
            var msg = JSON.parse(msg);
            callback(msg.streaming);
          });
      });
      // handle set_streaming_status event
      socket.on('set_streaming_status', function(status) {
        redisClient.get('sessions:' + socket.sessionID, function(err,msg) {
          var msg = JSON.parse(msg);
          msg.streaming = status;
          redisClient.set('sessions:' + socket.sessionID, JSON.stringify(msg));
        });
      });
    }
  });
  
  // handle socket error
  io.sockets.on('error', function() {
    console.log("socket error handled");
  });

  return io;
}
