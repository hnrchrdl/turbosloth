var queue = require('../models/queue');


/**
*** get the Queue from model and render it
**/
module.exports.render = function(req, res) {
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'playlistinfo',
    args: []
  }
  queue.fetchFromMpd(options, function(err, data) {
    if (err) return res.render('queue',{queue : {}});
    return res.render('queue',{queue :data});
  });
};