var express = require('express'),
  router = express.Router(),
  komponist = require('../lib/komponist');
  //socket = require('../lib/sockets');


//  ******************
//  *** the routes ***

// route for getting of /
router.get('/', function(req, res) {

  if (req.session.mpdhost && req.session.mpdport) {
    
    var sessionID = req.sessionID,
      port = req.session.mpdport,
      host = req.session.mpdhost,
      password = req.session.mpdpassword;
      //console.log(password);

    komponist.init(sessionID,port,host,password);
    if (password !== "") {
      komponist.authenticate(sessionID, password);
    }
    komponist.registerChange(sessionID);


      // register mpd listener for -changed- event
      
    var stream = (req.session.streamport === "") ?  
        req.session.streamurl : 
        req.session.streamurl + ':' + req.session.streamport;
    //console.log('stream: ' + stream);

    //render skeleton
    res.render('skeleton', { 

      title: 'turbosloth', 
      mpdhost: req.session.mpdhost,
      mpdport: req.session.mpdport,
      stream: stream
    });
  }

  // if no session is found
  else {
    res.render('login', { title: 'login'});
  }
});

// route for posting to /
router.post('/', function(req, res) {

  req.session.mpdhost = req.body.mpdhost;
  req.session.mpdport = req.body.mpdport;
  req.session.mpdpassword = req.body.mpdpassword;
  req.session.streamurl = req.body.streamurl;
  req.session.streamport = req.body.streamport;
  res.redirect('/');
});

// route for getting of /mpdplaylist
router.get('/mpdplaylist', function(req,res) {

  var secondsToTimeString = function (seconds) {

    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }
  //var columns = ['Pos', 'Title', 'Artist', 'Album', 'Genre', 'Time']
  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.playlistinfo(function(err, data) {

    res.render('playlist',{playlist:data,secondsToTimeString:secondsToTimeString});
  }); 
});

router.get('/manageplaylist', function(req,res) {

  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.listplaylists(function(err,data) {
    console.log(data);
    res.render('managePlaylist', {playlists:data});
  });
});

// route for getting of /logout
router.get('/logout', function(req,res) {

  req.session.destroy();
  res.redirect('/');
});

module.exports = {
  router: router
}
//module.exports = router;