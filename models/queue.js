var mpd = require('../lib/mpd');


/**
* get the current queue from mpd
* @param options {Object} 
* @param callback {Function}
*/
module.exports.fetchFromMpd = function(options, callback) {
  console.log('get queue from mpd');
  mpd.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    // save queue to redis
    //redis.set([options.host, options.port, 'queue'].join[':'], JSON.stringify(data));
    return callback(null, data);
  });
}