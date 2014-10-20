var komponist = require('komponist'),
  io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 });
  clients;

// initialize mpd client
module.exports.init = function(sessionID,port,host,password) {

  // to do: clean clients!

  // create new mpd client if no client exists for session
  if (clients) {
    console.log("clients found in session");
    var komponistClientExists =  (sessionID in clients) ? true : false;
  }
  else {
       clients = {};
  }
  if (!komponistClientExists) {
    // construct new client and listen to events
    console.log("create new komponist client");
    clients[sessionID] = komponist.createConnection(port,host);
  }
  return komponistClientExists;
};

// get mpd client from session
module.exports.getClient = function (sessionID) {
  try { return clients[sessionID]; }
  catch (err) { 
    console.log(err);
    return undefined;
  }
};

// authenticate mpd client
module.exports.authenticate = function(sessionID, password) {
  clients[sessionID].on('ready', function() {
    clients[sessionID].password(password, function(err, msg){
       if (err) { console.log(err); } 
       else { console.log('mpd authenticated'); }
    });
  });
};

// handle mpd change event
module.exports.registerChange = function (sessionID, io) {
  clients[sessionID].on('changed', function(system) {
    console.log('Subsystem changed: ' + system);
    if (system == 'player' || system == 'options' || system == 'playlist') {
      io_emitter.emit('change',system);
    }
  });
}
