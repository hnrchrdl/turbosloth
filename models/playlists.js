var mpd = require('../lib/mpd');


/**
*** get the playlists from mpd
*** @param options {Object} 
*** @param callback {Function}
**/
module.exports.fetchAllFromMpd = function(options, callback) {
  console.log('get queue from mpd');
  mpd.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    // save queue to redis
    //redis.set([options.host, options.port, 'queue'].join[':'], JSON.stringify(data));
    return callback(null, data);
  });
}


/**
*** get playlist details from mpd
*** @param options {Object} 
*** @param callback {Function}
**/
module.exports.fetchDetailsFromMpd = function(options, callback) {
  mpd.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    return callback(null, data);
  });
};