var mpd = require('../lib/mpd');


/**
*** render the Login Page
**/
module.exports.renderLogin = function(req, res) {
  res.render('login');
};


/**
*** render the Skeleton Page
**/
module.exports.renderSkeleton = function(req, res) {
  res.render('skeleton', {
    title: 'turbosloth',
    mpdhost: req.session.mpdhost,
    mpdport: req.session.mpdport,
    stream: req.session.streamurl
  });
};


/**
*** logs a user in and
*** sets the session object
**/
module.exports.login = function(req, res, next) {
  req.session.mpdhost = req.body.mpd.host || undefined;
  req.session.mpdport = req.body.mpd.port || undefined;
  req.session.mpdpassword = req.body.mpd.password || undefined;
  req.session.streamurl = req.body.streamurl || undefined;
  next();
};


/**
*** Redirect to Start Point after Login
**/
module.exports.redirectToStart = function(req, res){
  res.redirect('/queue');
}


/**
*** initialize Mpd
*** redirect to login if unsuccessful
**/
module.exports.initMpd = function(req, res, next) {
  if (req.session.mpdhost && req.session.mpdport) {
    var options = {
      sessionID: req.sessionID,
      host: req.session.mpdhost,
      port: req.session.mpdport,
      password: req.session.mpdpassword
    }
    mpd.init(options, function(err, obj) {
      if (err) {
        req.session.destroy(); // logout
        res.redirect('/login?err='+err);
      }
      else {
        next();
      }
    });
  } else { // if no session is found
    res.redirect('/login?err=nosession');
  }
}


/**
*** initialize the Streaming Source
**/
module.exports.initStream = function(req, res, next) {
  var streamurl = req.session.streamurl;
  if (streamurl === "") {
    streamurl = undefined;
  }
  next();
};
        

    
