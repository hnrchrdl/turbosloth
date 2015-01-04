var queue = require('../models/queue');

module.exports = {
  render: render,
  get: get
};

/**
*** get the Queue from model and render it
**/
function render(req, res) {
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

/**
*** get the Queue from model and return as JSON
**/
function get(req, res) {
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'playlistinfo',
    args: []
  }
  queue.fetchFromMpd(options, function(err, data) {
    if (err) return res.status(500).json({err: err, data: null});
    return res.json({err: null, data: data});
  });
}