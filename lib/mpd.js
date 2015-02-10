var komponist = require('komponist')
  , mpdClients
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 });


/**
** create a mpd client via kompnist
**
** @param options {Object} 
** @param callback {Function}
*/
function createClient(options, callback) {
  // create a new client, authenticate it and return it with callback.
  // if something goes wrong, return callback with error
  console.log('creating mpd client: ', options);
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


/**
** registers mpd change events
**
** @param client {Object}
** @param options {Object}
*/
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


/**
** registers mpd error events
**
** when mpd emits an error event
** inform the client that something bad has happend
** maybe should close down this connection and establish a new one
**
** @param client {Object}
** @param options {Object}
*/
function registerError(client, options) {
  
  client.on('error', function(err) {
    //client.close();
    console.log('mpd client error: ' + err);
    delete mpdClients[[options.sessionID, options.host, options.port].join(':')];
    io_emitter.to(options.sessionID).emit('clientError', 'mpd client error: ' + err + '. please reload the page.');
    // todo:
    // implement some error handling here
  });
}



/**
** authenticate mpd client
**
** authenticate with a password everytime a client is requested
** that is on init and when a mpd command gets issued
**
** @param client {Object}
** @param password {String}
** @param callback {Function}
*/
function authClient(client, password, callback) {

  console.log('authenticating client');
  client.password(password, function(err, msg) { // authenticate with password
    if (err) { //authentication failed
      console.log(err);
      //client.close();
      //delete mpdClients[[options.host, options.port].join(':')];
      return callback(err);
    } else { // authentification success
      console.log('mpd authenticated')
      return callback(null, msg);
    }
  });
}


/**
** initialize mpd
**
** either get an existing client from the mpdClients Object
** or create a new client.
** this client will be hanging around idle in the namespace, 
** listing for change and error events
**
** @param options {Object}
** @param callback {Function}
*/
var init = module.exports.init = function( options, callback ) {
  
  if ( !mpdClients ) mpdClients = {};
  
  if ( [ options.sessionID, options.host, options.port ].join( ':' ) in mpdClients ) {
    console.log( 'mpd client found' );
    var client = mpdClients[ [ options.sessionID, options.host, options.port ].join( ':' ) ];
    authClient( client, options.password, function( err, msg ) {
      if ( err ) return callback( err, null );
      return callback( null, client );
    });
  } else {
    createClient( options, function( err, client ) {
      if ( err ) return callback( err );
      console.log( 'new client created' );
      mpdClients[ [ options.sessionID, options.host, options.port ].join( ':' ) ] = client;
      registerChange( client, options );
      registerError( client, options );
      return callback( null, client );
    });
  }
};


/**
** fire a custom mpd command
**
** the option object must contain:
** sessionID, 
** host, 
** port, 
** command (as cmd) and 
** optional arguments (as args)
**
** if no arguments are needed, supply an empty Array instead
**
** @param options {Object}
** @param callback {Function}
*/
module.exports.fireCommand = function( options, callback ) {
  if ( mpdClients && mpdClients[ [ options.sessionID, options.host, options.port ].join( ':' ) ] ) {
    mpdClients[ [ options.sessionID, options.host, options.port ].join( ':' ) ]
        .command(options.cmd, options.args, function( err, msg ) {
      if ( callback ) {
        return callback( err, msg );
      }
    });
  } else {
    console.log( 'error firing mpd command: ' );
    io_emitter.to( options.sessionID ).emit( 'clientError', 'mpd client lost in space. please reload page.' );
    return callback( 'mpd error', null );
  }
}

/**
** job to clean up the mpdClient namespace
**
** under construction
**
** @param client {Object}
** @param callback {Function}
*/
module.exports.clientCleanup = function ( argument ) {
  // body...
}