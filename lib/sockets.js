var socketio = require('socket.io')
  , redisAdapter = require('socket.io-redis')
  , cookie = require('cookie')
  , signature = require('cookie-signature')
  , redis = require('./redis')
  , mpd = require('./mpd');


/**
* listen function to be passed to app.js
* once a socket connection is established, 
* read the sessionID from the cookie and
* make all the neccessary assignments and registrations 
*
* @method listen
* @param {Object} Express app Object
* @return {Object} io Object
*/
module.exports.listen = function(app) {

  var io = socketio.listen(app, {'force new connection': true}); //init io
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 })); // use io with redis


  // handle socket connection
  io.sockets.on('connection', function (socket) {
    
    console.log('A socket connected');
    
    socket.sessionID = getSessionIdFromCookie(socket);
    
    if (socket.sessionID) {
      socket.join(socket.sessionID); // join room sessionID
      registerMpd(socket); // 
      registerGetStreamingStatus(socket);
      registerSetStreamingStatus(socket);
      registerError(socket);
    }
  });

  return io;
}


/**
* get the sessionID from the cookie
* using the signature library 
*
* @method getSessionIdFromCookie
* @param {Object} socket Object
* @return {String} session ID or undefined
*/
function getSessionIdFromCookie(socket) {
  // parse the cookie to get the sessionID
  if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
    var raw = cookie.parse(socket.handshake.headers.cookie)['express.sid'];
    if (raw) {
      // The cookie set by express-session begins with s: which indicates it
      // is a signed cookie. Remove the two characters before unsigning.
      return signature.unsign(raw.slice(2), 'a4f8071f-c873-4447-8ee2') || undefined;
    } else {
      return undefined;
    }
  }
}


/**
* register mpd socket events
*
* when client has emitted an mpd event
* get the session data out of redis and
* fire the appropiate command
*
* @method registerMpd
* @param {Object} socket object
* @return {Function} callback
*/
function registerMpd(socket) {
  socket.on('mpd', function(cmd, args, callback) {
   
    redis.get('sessions:' + socket.sessionID, function(err, session) {
      if (err) {
        if (callback) {
          return callback(err);
        }
      } else {
        var session = JSON.parse(session); // parse session
        var options = {
          sessionID: socket.sessionID,
          host: session.mpdhost,
          port: session.mpdport,
          password: session.mpdpassword,
          cmd: cmd,
          args: args
        }
        mpd.fireCommand(options, function(err, msg) {
          console.log(err, msg);
          if (callback) {
            if (err) return callback(err);
            return callback(null, msg);
          }
        });
      }
    });
  });
}


/**
* get streaming status
* this will not be needed in the future
*
* @method registerGetStreamingStatus
* @param socket {Object}
* @return {Function} callback
*/
function registerGetStreamingStatus(socket) {
  socket.on('get_streaming_status', function(callback) {
    redis.get('sessions:' + socket.sessionID, function(err,msg) {
      var msg = JSON.parse(msg);
      return callback(msg.streaming);
    });
  });
      
}


/**
* set streaming status
* this will not be needed in the future
*
* @param socket {Object}
*/
function registerSetStreamingStatus(socket) {
  socket.on('set_streaming_status', function(status) {
    redis.get('sessions:' + socket.sessionID, function(err,msg) {
      var msg = JSON.parse(msg);
      msg.streaming = status;
      redisClient.set('sessions:' + socket.sessionID, JSON.stringify(msg));
    });
  });
}


/**
* general socket error handling 
*
* possible todo:
* implement some more error handling
* 
* @param socket {Object}
*/
function registerError(socket) {
  socket.on('error', function() {
    console.log('socket error');
  });
}
