var browseModel = require('../models/browse');


module.exports = {
  browse: browse
};

//////////////////////////////////////////////


/* browse mpd server */

function browse(req,res) {
  var path = (typeof req.query.path != 'undefined') ? 
    req.query.path :
    ""; // if url contains no path variable

  console.log(path);
  
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'lsinfo',
    args: [path]
  }
  browseModel.fetchFromMpd(options, function(err, data) {
    if (path != "") {
      console.log(options, err, data);
    }
    return res.json({err: err, contents: data});
  });
}


///////// old stuff /////////////////////////
/**
*** render the browse page 
*** the path is passed via query
**/
module.exports.render = function(req, res) {
  var browsepath = req.query.path;
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'lsinfo',
    args: [browsepath]
  }
  browse.fetchFromMpd(options, function(err, data) {
    if (err) return res.render('browse', {dirs:[], files:[], breadcrumbs:false});
    return res.render('browse', {dirs:data.dirs, files:data.files, breadcrumbs:data.breadscrumbs});
  });
};
