var komponist = require('komponist');
var socket = require('../app').io;

var clients;

var init = function(sessionID,port,host,password) {

  // to do: clean clients!!

  // get or create komponist client from session
  if (clients) {
    //console.log(clients);
    var komponistClientExists =  (sessionID in clients) ? true : false;   
  }
  else {
       clients = {};
       //console.log(clients);
  }
  if (!komponistClientExists) {
    // construct new client and listen to events
    clients[sessionID] = komponist.createConnection(port,host);
    //console.log(clients);
  }
};

var getClient = function (sessionID) {
  //console.log(clients[sessionID]);
  try {
    return clients[sessionID];
  }
  catch (e) {
    console.log(e);
  }
};

var authenticate = function(sessionID, password) {

  clients[sessionID].on('ready', function(err, msg) {

    clients[sessionID].password(password, function(err,msg){

       if (err) {
         //console.log(err + password);
      } else {
         //console.log('mpd authenticated');
      }
    });
  });
};

var registerChange = function (sessionID) {

  clients[sessionID].on('changed', function(system) {

    console.log('Subsystem changed: ' + system);
    if (system == 'player' || system == 'options') {
      //console.log('changed');
      //console.log('   '+socket.listen);
      //console.log(socket.emitChange);
      io.emitChange(system);
    }
  });
}


module.exports = {
  init: init,
  getClient: getClient,
  authenticate: authenticate,
  registerChange: registerChange
};