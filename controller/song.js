var song = require('../models/song');


module.exports = {
  getSong: getSong
};

/////////////////////////


function getSong(req,res) {
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'currentsong',
    args: []
  };
  song.fetchFromMpd(options, function(err, data) {
    return res.json({error: err, song: data});
  });
}