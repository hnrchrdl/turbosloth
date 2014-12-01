var request = require('request')
  , http = require('http')
  , komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  , komponistClients;


function createClient(options, callback) {
  // create a new client, authenticate it and return it with callback.
  // if something goes wrong, return callback with error
  console.log(options);
  komponist.createConnection(options.port, options.host, function(err, client) {
    if (err) {
      console.log(err);
      return callback(err);
    } else {
      authClient(client, options.password, function(err, msg) {
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
    //console.log('Subsystem changed: ' + system + '. session: ' + sessionID + '. host: ' + host + '. port: ' + port);
    console.log('Subsystem changed: ' + system + ' on client: ' + client);
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
    client.close();
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
      delete komponistClients[[options.host, options.port].join(':')];
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
  komponistClients = (typeof komponistClients !== 'undefined') 
    ? komponistClients 
    : {};
  var client = komponistClients[[options.host, options.port].join(':')];
  if (client) {
    console.log('client exists. authenticating...')
    authClient(client, options.password, function(err, msg) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        console.log('returning... ' + client);
        return callback(null, client);
      }
    });
  } else { // create new client and return it
    createClient(options, function(err, client) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        console.log('new client created');
        komponistClients[[options.host, options.port].join(':')] = client;
        registerChange(client);
        registerError(client);
        return callback(null, client);
      }
    });
  }

};


module.exports.fireCommand = function(options, callback) {
  
  try {
    komponistClients[[options.host, options.port].join(':')]
        .command(options.cmd, options.args, function(err, data) {
      if (callback) {
         if (err) {
          console.log('error firing mpd command: ' + err);
          io_emitter.emit('clientError');
          delete komponistClients[[options.host, options.port].join(':')];
          return callback(err);
        } else {
          return callback(null, data);
        }
      }
    });
  } catch (e) {
    console.log('error firing mpd command: ' + e);
    delete komponistClients[[options.host, options.port].join(':')];
    io_emitter.emit('clientError');
  }
}


module.exports.clientCleanup = function (argument) {
  // body...
}


//var publish
