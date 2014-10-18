var socketio = require('socket.io'),
  redisAdapter = require('socket.io-redis'),
  cookie = require('cookie'),
  signature = require('cookie-signature'),
  //redisClient = require('redis').createClient(6379, 'localhost'),
  app = require('../app').app,
  redis = require('redis'),
  komponist = require('./komponist');

var config = require('../config.json')[app.get('env')];

var redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);


var listen = function(app) {

  var io = socketio.listen(app);
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

  io.sockets.on('connection', function (socket) {
    console.log('A socket connected');
    
    socket.on('error', function() {
      console.log("socket error handled");
    });
    //console.log(socket);

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

      socket.on('mpd', function(cmd,args,callback) {

        //console.log('mpd _ ' + cmd + " _ " + args + " _ " + callback)

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
            console.log(socket.sessionID);
            var msg = JSON.parse(msg);
            console.log(msg);
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
  });

  return io;
}

module.exports = {
  listen: listen
}
