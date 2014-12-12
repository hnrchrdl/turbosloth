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


function registerChange(client, options) {
  // if a change happens in mpd, inform the client
  client.on('changed', function(system) {
    //console.log('Subsystem changed: ' + system + '. session: ' + sessionID + '. host: ' + host + '. port: ' + port);
    console.log('Subsystem changed: '  + system + 
        '.host: ' + options.host + '. port: '+ options.port + 
        '. session: ' + options.sessionID + '.');
    if (system == 'player' || system == 'options' || system == 'playlist') {
      io_emitter.to(options.sessionID).emit('change', system);
    }
  });
}

function registerError(client, options) {
  // when mpd emits an error event
  // inform the client that something bad has happend
  // maybe should close down this connection and establish a new one
  client.on('error', function(err) {
    //client.close();
    console.log('mpd client error: ' + err);
    delete komponistClients[[options.sessionID, options.host, options.port].join(':')];
    io_emitter.to(options.sessionID).emit('clientError', 'mpd client error: ' + err + '. please reload the page.');
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
      //client.close();
      //delete komponistClients[[options.host, options.port].join(':')];
      return callback(err);
    } else { // authentification success
      console.log('mpd authenticated')
      return callback(null, msg);
    }
  });
}


// initialize mpd client
var init = module.exports.init = function(options, callback) {
  // either get an existing client from the komponistClients Object
  // or create a new client.
  // this client will be hanging around idle in the namespace, 
  // listing for change and error events
  if (!komponistClients) komponistClients = {};
  if ([options.sessionID, options.host, options.port].join(':') in komponistClients) {
    console.log('mpd client found');
    var client = komponistClients[[options.sessionID, options.host, options.port].join(':')];
    authClient(client, options.password, function(err, msg) {
      if (err) return callback(err, null);
      return callback(null, client);
    });
  } else {
    createClient(options, function(err, client) {
      if (err) return callback(err);
      console.log('new client created');
      komponistClients[[options.sessionID, options.host, options.port].join(':')] = client;
      registerChange(client, options);
      registerError(client, options);
      return callback(null, client);
    });
  }
};


module.exports.fireCommand = function(options, callback) {
  console.log(options);
  if (komponistClients && komponistClients[[options.sessionID, options.host, options.port].join(':')]) {
    komponistClients[[options.sessionID, options.host, options.port].join(':')]
        .command(options.cmd, options.args, function(err, data) {
      if (callback) {
         if (err) {
          console.log(err);
          //io_emitter.to(options.sessionID).emit('clientError', 'error firing mpd command: ' + err);
          //komponistClients[[options.host, options.port].join(':')].close();
          return callback(err);
        } else {
          return callback(null, data);
        }
      }
    });
  } else {
    console.log('error firing mpd command: ');
    io_emitter.to(options.sessionID).emit('clientError', 'mpd client lost in space. please reload page.');
    return callback('error');
  }
}


module.exports.clientCleanup = function (argument) {
  // body...
}


//var publish
