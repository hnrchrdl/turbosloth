var mpd = require('../lib/mpd');

module.exports.fetchFromMpd = function(options, callback) {
  mpd.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    return callback(null, data);
  });
};