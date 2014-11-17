var request = require('request')
  , http = require('http')
  , komponist = require('komponist')
  , io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 })
  , komponists;

// initialize mpd client
module.exports.init = function(port, host, password, callback) {

  request.head('http://' + host, function(err, resp) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    else {
      console.log('URL Valid');
      console.log(resp.headers);

      // request({
      //   method: 'GET',
      //   url: {
      //     protocol: 'http:',
      //     host: 'leukosia.eu',
      //     port: 6601,
      //     pathname: '/',
      //   },
      //   timeout: 5000 
      // }, function(err, response, body) {
      //   console.log(err);
      //   //console.log(response);
      //   //console.log(body);
      // });

      var mpdNamespace = host + ":" + port; // the namespace for the connection
      if (komponists) {
        //check for namespace of current mpd connection
        var komponistFound =  (mpdNamespace in komponists) ? true : false; 
      }
      else {
        // komponists is empty
        komponists = {};
      }
      if (!komponistFound) { // construct new client and listen to events
        var client = komponist.createConnection(port, host);
        client.once('ready', function() {
          authClient(client, password, mpdNamespace, komponistFound, function(err, obj) {
            callback(err, obj);
          });
        });
      }
      else { // use existing client
        client = komponists[mpdNamespace];
        authClient(client, password, mpdNamespace, komponistFound, function(err, obj) {
          callback(err, obj);
        });
      }
    }
  });
};

// get mpd client from session
module.exports.getClient = function (mpdNamespace) {
  try { return komponists[mpdNamespace]; }
  catch (err) { 
    console.log(err);
    io_emitter.emit('clientError');
    return undefined;
  }
};

// register mpd change event
var registerChange = function (mpdNamespace) {
  //setInterval(function(){console.log(komponists[mpdNamespace] == undefined)},1000);
  komponists[mpdNamespace].on('changed', function(system) {
    console.log('Subsystem changed: ' + system + ' on ' + mpdNamespace);
    if (system == 'player' || system == 'options' || system == 'playlist') {
      io_emitter.emit('change', system);
    }
  });
};

var authClient = function(client, password, mpdNamespace, komponistFound, callback) {
  client.password(password, function(err, msg) { // authenticate with password
    if (err) { //authentication failed
      return callback(err);
    }
    else { // authentification success
      console.log('mpd authenticated');
      if (!komponistFound) { //only if client is new
        komponists[mpdNamespace] = client; // save client in namespace
        registerChange(mpdNamespace);
        console.log('mpd listening for "changed" events');
      }
      callback(null, true);
    }
  });
}