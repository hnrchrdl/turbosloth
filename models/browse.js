var mpd = require('../lib/mpd');



module.exports.fetchFromMpd = function(options, callback) {
  console.log('get browse: ', options.args);
  mpd.fireCommand(options, function(err, data) {
    return callback(err, data);
  });
};