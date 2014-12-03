var queue = require('../models/queue');


/**
* get the queue from model and render it
*/
module.exports.renderQueue = function(req, res) {
  var type = req.query.type || 'mpd';
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword
  }
  switch(type) {
    case 'mpd':
      queue.getFromMpd(options, function(err, data) {
        if (err) data = null;
        res.render('queue',{queue :data});
      });
      break;
    case 'redis':
      queue.getFromRedis(options, function(err, data) {
        if (err) data = null;
        res.render('queue',{queue :data});
      });
      break;
  }
}