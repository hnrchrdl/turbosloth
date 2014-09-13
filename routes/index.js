var express = require('express'),
  //app = require('../app'),
  router = express.Router(),
  socketio = require('socket.io'),
  cookie    = require('cookie'),
  signature = require('cookie-signature'),
  komponist = require('komponist'),
  io,
  komponistClients,
  emitChange,
  redis = require('redis'),
  redisClient = redis.createClient(6379, 'localhost');


//  ******************
//  *** the routes ***

// route for getting of /
router.get('/', function(req, res) {

  if (req.session.mpdhost && req.session.mpdport) {
    
    var port = req.session.mpdport,
      host = req.session.mpdhost,
      sessionID = req.sessionID;


    // get or create komponist client from session
    if (komponistClients) {
      var komponistClientExists =  (sessionID in komponistClients) ? true : false;   
    }
    else {
         komponistClients = {};
    }

    if (!komponistClientExists) {
      // construct new client and listen to events
      komponistClients[sessionID] = komponist.createConnection(port,host);
      var komponistClient = komponistClients[sessionID];
      // register mpd listener for -ready- event
      komponistClient.on('ready', function(err, msg) {
        if (req.session.mpdpassword) {
          komponistClient.password(req.session.mpdpassword, function(err,msg){
            if (err) console.log(err); 
            else console.log('mpd authenticated');
          });
        }
      });
      // register mpd listener for -changed- event
      komponistClient.on('changed', function(system) {
        console.log('Subsystem changed: ' + system);
        if (system == 'player' || system == 'options') {
          emitChange(system);
        }
      });
    }

    //render skeleton
    res.render('skeleton', { 
      title: 'T U R B O S L O T H', 
      mpdhost: req.session.mpdhost,
      mpdport: req.session.mpdport
    });
  }

  // if no session is found
  else {
    res.render('login', { title: 'login' });
  }
});

// route for posting to /
router.post('/', function(req, res) {
  req.session.mpdhost = req.body.mpdhost;
  req.session.mpdport = req.body.mpdport;
  req.session.mpdpassword = req.body.mpdpassword,
  res.redirect('/');
});

// route for getting of /mpdplaylist
router.get('/mpdplaylist', function(req,res) {
  var secondsToTimeString = function (seconds) {
    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }
  var columns = ['Pos', 'Title', 'Artist', 'Album', 'Genre', 'Time']
  var komponistClient = req.sessionID ? komponistClients[req.sessionID] : false; 
  komponistClient.playlistinfo(function(err, data) {
    res.render('playlist',{playlist:data,columns:columns,secondsToTimeString:secondsToTimeString});
  }); 
});

// route for getting of /logout
router.get('/logout', function(req,res) {
  req.session.destroy();
  res.redirect('/');
});

// *************************
// *** set up the socket ***

var listen = function(app) {

  io = socketio.listen(app);
  
  io.sockets.on('connection', function (socket) {
    console.log('A socket connected');

    if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
      var raw = cookie.parse(socket.handshake.headers.cookie)['express.sid'];
      if (raw) {
          // The cookie set by express-session begins with s: which indicates it
          // is a signed cookie. Remove the two characters before unsigning.
          socket.sessionID = signature.unsign(raw.slice(2), 'a4f8071f-c873-4447-8ee2') || undefined;
        }
      }
      /*if (socket.sessionID) {
        redisClient.get('sessions:' + socket.sessionId, function(err, session) {
          socket.session = session;
        });
      }*/

      if (socket.sessionID) {
        socket.on('mpd', function(cmd,args,callback) {
          var komponistClient = komponistClients[socket.sessionID];
          if (komponistClient) {
            console.log(cmd + " - " + args);
            redisClient.get('sessions:' + socket.sessionID, function(err, session) {
            });
            komponistClient.command(cmd,args,function(err,msg) {
              if (err) console.log('mpd-error: ' + err)
                if (callback) callback(err, msg);
            });
          }
        });


        emitChange = function (system) {
        // sends the mpd system change to the browser
        // this is done when side is lodaed
        // or something on Mpd has happend
        socket.emit('change',system);
      }
    }
  });
  // make io availible to other modules
  return io;  
}

module.exports = {
  listen: listen,
  router: router
}
//module.exports = router;