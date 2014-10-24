var komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  //, redis = require('redis')
  //, config = require('../app').config // import config
  , clients
  , komponists;

//var redisClient = redis.createClient(config.redisPort, config.redisHost);
//redisClient.select(config.redisDatabase);

// initialize mpd client
module.exports.init = function(port, host, password, callback) {

  var mpdNamespace = host + ":" + port; // create a unique id for the connection

  if (komponists) {
    //check for namespace of current mpd connection
    var komponistFound =  (mpdNamespace in komponists) ? true : false; 
  }
  else {
    // komponists is empty
    komponists = {};
  }
  if (!komponistFound) {
    // construct new client and listen to events
    console.log("create new komponist client");
    komponists[mpdNamespace] = komponist.createConnection(port, host);
    console.log('authenticating komponist client...');
    authClient(mpdNamespace, password, function(status) {
      console.log('authentication: ' + status);
      callback(status);
    });
  }
  else {
    console.log('found komponist client for ' + mpdNamespace);
    callback(true)
  }
};

// get mpd client from session
module.exports.getClient = function (mpdNamespace) {
  try { return komponists[mpdNamespace]; }
  catch (err) { 
    console.log(err);
    return undefined;
  }
};

// authenticate mpd client
authClient = function(mpdNamespace, password, callback) {
  var komponist = komponists[mpdNamespace];
  komponist.once('ready', function() {
    if (password) {
      komponist.password(password, function(err, msg) {
        if (err) { // authenticate with password
          console.log('mpd authentication error: ' + err);
          callback(false);
        } 
        else { 
          console.log('mpd authenticated');
          registerChange(mpdNamespace);
          console.log('mpd listening for "changed" events');
          callback(true); 
        }
      });
    }
    //else {
      // toDo: handle registering mpd w/o callback
    //}
  });
};
// register mpd change event
registerChange = function (mpdNamespace) {
  komponists[mpdNamespace].on('changed', function(system) {
    console.log('Subsystem changed: ' + system + ' on ' + mpdNamespace);
    if (system == 'player' || system == 'options' || system == 'playlist') {
      io_emitter.emit('change', system);
    }
  });
}
