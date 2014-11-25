var request = require('request')
  , http = require('http')
  , komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  , komponistClients = {};

function createClient(sessionID, host, port, password, callback) {
  
    var client = komponist.createConnection(port, host, function(err, client) {
      if (err) {
        return callback(err, false);
      } else {
        authClient(client, password, function(err, msg) {
          if (err) {
            console.log(err);
            return callback(err, msg);
          } else {
            //subscribe(host, port); // subscribe to namespace
            //subscriber.on()
            registerChange(sessionID);
            registerError(sessionID, host, port, password);
            return callback(err, client);
          }
        })
      }
    });
  
}

// register mpd change event
var registerChange = function (sessionID) {
  //setInterval(function(){console.log(komponists.mpdNamespace == undefined)},1000);
  komponistClients.sessionID
    //.once('changed', function(system) {
    .on('changed', function(system) {
      console.log('Subsystem changed: ' + system + ' on session ' + sessionID);
      if (system == 'player' || system == 'options' || system == 'playlist') {
        io_emitter.emit('change', system);
      }
    //return registerChange(sessionID);
  });
};

var registerError = function (sessionID, host, port, password) {
  komponistClients.sessionID
    .on('error', function(err) {
      console.log(err);
      io_emitter.emit('clientError');
      komponistClients.sessionID.close();
      return setTimeout(function() { createClient(sessionID, host, port, password) }, 5000);
      //return registerError(sessionID, host, port, password);
    });
};


var authClient = function(client, password, callback) {
  client
    .password(password, function(err, msg) { // authenticate with password
      if (err) { //authentication failed
        console.log(err);
        return callback(err, false);
      } else { // authentification success
        console.log('mpd authenticated')
        komponistClients.sessionID = client;
        return callback(err, msg);
      }
    });
}

var subscribe = function(host, port) {
  komponistClients.sessionID
    .createConnection(function(err, subscriber) {
      subscriber.subscribe(host + ':' + port);
      subscriber.on('message', function () {

      });
  })
};

// initialize mpd client
module.exports.init = function(sessionID, host, port, password, callback) {
  //komponistClient = false;
  if (!sessionID in komponistClients || !komponistClients.sessionID) {

    createClient(sessionID, host, port, password, function(err, msg) {
      console.log(err);
      console.log('1');
      return callback(err, msg);
    });
  } else {
    authClient(komponistClients.sessionID, password, function(err, msg) {
      return callback(err, msg);
    });
  }

};

module.exports.getClient = function (sessionID) {
  return komponistClients.sessionID;
}


module.exports.clientCleanup = function (argument) {
  // body...
}


//var publish