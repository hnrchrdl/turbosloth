var status = require('../models/status');


module.exports = {
  getStatus: getStatus
};

/////////////////////////


function getStatus(req, res) {
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'status',
    args: []
  };
  status.fetchFromMpd(options, function(err, data) {
    return res.json({error: err, status: data});
  });
}