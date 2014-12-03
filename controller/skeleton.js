var komponist = require('../lib/komponist');

module.exports.initMpd = function(req, res, next) {
  if (req.session.mpdhost && req.session.mpdport) {
    var options = {
      sessionID: req.sessionID,
      host: req.session.mpdhost,
      port: req.session.mpdport,
      password: req.session.mpdpassword
    }
    komponist.init(options, function(err, obj) {
        if (err) {
          console.log('komponist init failed');
          req.session.destroy(); // logout
          console.log(err);
          res.redirect('/login?err='+err);
        }
        else {
          console.log('komponist init success!');
          next();
        }
    });
  } else { // if no session is found
    res.redirect('/login?err=nosession');
  }
}
   
module.exports.initStream = function(req, res, next) {
  var streamurl = req.session.streamurl;
    if (streamurl === "") {
      streamurl = undefined;
    }
    next();
}
        
        //render skeleton


module.exports.renderSkeleton = function(req, res) {
  res.render('skeleton', {
    title: 'turbosloth',
    mpdhost: req.session.mpdhost,
    mpdport: req.session.mpdport,
    stream: req.session.streamurl
  });
}

    
    