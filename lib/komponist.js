var request = require('request')
  , http = require('http')
  , komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  , komponistClients;

function createClient(sessionID, host, port, password, callback) {
  
    var client = komponist.createConnection(port, host, function(err, client) {
      if (err) {
        return callback(err, false);
      } else {
        authClient(client, password, function(err, msg) {
          if (err) {
            console.log(err.message);
            return callback(err);
          } else {
            //subscribe(host, port); // subscribe to namespace
            //subscriber.on()
            komponistClients[sessionID + ':host' + ':port'] = client;
            registerChange(sessionID, host, port);
            registerError(sessionID, host, port, password);
            return callback(null, client);
          }
        })
      }
    });
  
}

// register mpd change event
var registerChange = function (sessionID, host, port) {
  //setInterval(function(){console.log(komponists.mpdNamespace == undefined)},1000);
  komponistClients[sessionID + ':host' + ':port']
    //.once('changed', function(system) {
    .on('changed', function(system) {
      console.log('Subsystem changed: ' + system + '. session: ' + sessionID + '. host: ' + host + '. port: ' + port);
      if (system == 'player' || system == 'options' || system == 'playlist') {
        io_emitter.emit('change', system);
      }
    //return registerChange(sessionID);
  });
};

var registerError = function (sessionID, host, port, password) {
  komponistClients[sessionID + ':host' + ':port']
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
      console.log('auth: ' + err, msg);
      if (err) { //authentication failed
        return callback(err);
      } else { // authentification success
        console.log('mpd authenticated')
        //komponistClients[sessionID + ':host' + ':port'] = client;
        return callback(null, msg);
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
  komponistClients = (typeof komponistClients !== 'undefined') ? komponistClients : {};
  if ( (komponistClients[sessionID + ':host' + ':port']) ) {
    authClient(komponistClients[sessionID + ':host' + ':port'], password, function(err, msg) {
      return callback(err, msg);
    });
  } else {
    createClient(sessionID, host, port, password, function(err, msg) {
      if (err) {
        console.log(err);
      } else {
        return callback(null, msg);
      }
    });
  }

};

module.exports.getClient = function (sessionID, host, port) {
  return komponistClients[sessionID + ':host' + ':port'];
}


module.exports.clientCleanup = function (argument) {
  // body...
}


//var publish