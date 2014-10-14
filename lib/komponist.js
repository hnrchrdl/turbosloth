var komponist = require('komponist'),
  //redisClient = require('redis').createClient(6379, 'localhost'),
  io_emitter = require('socket.io-emitter')({ host:'localhost', port: 6379 });

var clients;

var init = function(sessionID,port,host,password) {

  //console.log(io);

  // to do: clean clients!!

  // get or create komponist client from session
  if (clients) {
    //console.log(clients);
    console.log("clients found in session");
    var komponistClientExists =  (sessionID in clients) ? true : false;
  }
  else {
       clients = {};
       //console.log(clients);
  }
  if (!komponistClientExists) {
    // construct new client and listen to events
    console.log("create new komponist client");
    clients[sessionID] = komponist.createConnection(port,host);
    //console.log(clients);
  }
  return komponistClientExists;
};

var getClient = function (sessionID) {
  try {
    return clients[sessionID];
  }
  catch (e) {
    
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

var registerChange = function (sessionID, io) {
  console.log("register kompnist change");
  clients[sessionID].on('changed', function(system) {
    console.log('Subsystem changed: ' + system);
    if (system == 'player' || system == 'options' || system == 'playlist') {
      //console.log('changed');
      //console.log('   '+socket.listen);
      //console.log(socket.emitChange);
      //require('./sockets').get().emit('change',system);
      //console.log(io_emitter);
      io_emitter.emit('change',system);
    }
  });
}


module.exports = {
  init: init,
  getClient: getClient,
  authenticate: authenticate,
  registerChange: registerChange
};