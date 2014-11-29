var request = require('request')
  , http = require('http')
  , komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  , komponistClients;


function createClient(options, callback) {
  // create a new client, authenticate it and return it with callback.
  // if something goes wrong, return callback with error
  komponist.createConnection(options.port, options.host, function(err, client) {
    if (err) {
      console.log(err);
      return callback(err);
    } else {
      authClient(client, password, function(err, msg) {
        if (err) {
          console.log(err);
          return callback(err);
        } else {
          return callback(null, client);
        }
      });
    }
  });
}


function registerChange(client) {
  // if a change happens in mpd, inform the client
  client.on('changed', function(system) {
    console.log('Subsystem changed: ' + system + '. session: ' + sessionID + '. host: ' + host + '. port: ' + port);
    if (system == 'player' || system == 'options' || system == 'playlist') {
      io_emitter.emit('change', system);
    }
  });
}

function registerError(client) {
  // when mpd emits an error event
  // inform the client that something bad has happend
  // maybe should close down this connection and establish a new one
  client.on('error', function(err) {
    console.log('mpd client error: ' + err);
    io_emitter.emit('clientError');
    // todo:
    // implement some error handling here
  });
}


function authClient(client, password, callback) {
  // authenticate with a password everytime a client is requested
  // that is on init and when a mpd command gets issued
  client.password(password, function(err, msg) { // authenticate with password
    if (err) { //authentication failed
      console.log(err);
      return callback(err);
    } else { // authentification success
      console.log('mpd authenticated')
      return callback(null, msg);
    }
  });
}


// initialize mpd client
module.exports.init = function(options, callback) {
  // either get an existing client from the komponistClients Object
  // or create a new client.
  // this client will be hanging around idle in the namespace, 
  // listing for change and error events
  if (komponistClients[options.namespace])  {
    authClient(options.namespace, options.password, function(err, msg) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        return (null, client);
      }
    });
  } else { // create new client and return it
    createClient(options.namespace, options.password, function(err, client) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
      console.log('new client created');
      komponistClients[sessionID + ':host' + ':port'] = client;
      registerChange(sessionID, host, port);
      registerError(sessionID, host, port, password);
      return callback(null, client);
    });
  }

};


module.exports.getClient = function(options, callback) {
  // get komponistClient if it exists in namespace
  // or create new one and return it
  komponistClients = (typeof komponistClients === 'undefined')
    ? {}
    : komponistClients;
  if (typeof komponistClients !== 'undefined' && komponistClients[namespace]) {
    console.log('komponist client exists');
    return callback(null, komponistClients[namespace]);
  } else {
    createClient(namespace, password, function() {
      if (err) {
        return callback(err);
      } else {
        return callback(null, client);
      }
    });
  }
}


module.exports.fireCommand = function(options, callback) {
  
  if ((options.host) && (options.port) && 
      (options.password) && (options.args)) {
    
    komponist.getClient(options, function(err, client) {
      if (err) {
        callback ? return callback(err);
      } else {
        
        client.command(options.cmd, options.args, function(err, msg) {
          if (err) {
            console.log(err);
            callback ? return callback(err);
          } else {
            callback ? return callback(null, msg);
          }
        });
      }
    });
  }
}


module.exports.clientCleanup = function (argument) {
  // body...
}


//var publish
