var socketio = require('socket.io')
  , redisAdapter = require('socket.io-redis')
  , cookie = require('cookie')
  , signature = require('cookie-signature')
  , redisClient = require('./redis').getClient()
  , komponist = require('./komponist');


module.exports.listen = function(app) {

  var io = socketio.listen(app, {'force new connection': true}); //init io
  
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 })); // use io with redis

  // handle socket connection
  io.sockets.on('connection', function (socket) {
    
    console.log('A socket connected');
    
    socket.sessionID = getSessionIdFromCookie(socket);
    
    if (socket.sessionID) {
      socket.join(socket.handshake.sessionID);
     
      socket.on('mpd', function(cmd, args, callback) {
        // client has emitted an mpd event
        // get the session data out of redis and
        // fire the command to 
        redisClient.get('sessions:' + socket.sessionID, function(err, session) {
          var session = JSON.parse(session); // parse session
          var options = {
            sessionID: socket.sessionID,
            host: session.mpdhost,
            port: session.mpdport,
            password: session.mpdpassword,
            cmd: cmd,
            args: args
          }
          komponist.fireCommand(options, function(err, msg) {
            if (err) {
              return callback(err);
            } else {
              return callback(null, msg);
            }
          });
        });
      });

      socket.on('get_streaming_status', function(callback) {
        redisClient.get('sessions:' + socket.sessionID, function(err,msg) {
          var msg = JSON.parse(msg);
          callback(msg.streaming);
        });
      });
      
      socket.on('set_streaming_status', function(status) {
        redisClient.get('sessions:' + socket.sessionID, function(err,msg) {
          var msg = JSON.parse(msg);
          msg.streaming = status;
          redisClient.set('sessions:' + socket.sessionID, JSON.stringify(msg));
        });
      });
      
      socket.on('error', function() {
        console.log('socket error');
        // todo:
        // implement some more error handling
      });
    }
  });
  
  // handle socket error
  io.sockets.on('error', function() {
    // this never gets fired somehow
    // maybe not necessary
    console.log("socket error handled");
  });

  return io;
}


function getSessionIdFromCookie(socket) {
  // parse the cookie to get the sessionID
  if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
    var raw = cookie.parse(socket.handshake.headers.cookie)['express.sid'];
    if (raw) {
      // The cookie set by express-session begins with s: which indicates it
      // is a signed cookie. Remove the two characters before unsigning.
      return signature.unsign(raw.slice(2), 'a4f8071f-c873-4447-8ee2') || undefined;
    } else 
      return undefined;
    }
  }
}
