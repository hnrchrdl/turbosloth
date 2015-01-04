var mpd = require('../lib/mpd');
var _ = require('underscore');


/**
* get the current queue from mpd
* @param options {Object} 
* @param callback {Function}
*/
module.exports.fetchFromMpd = function(options, callback) {
  console.log('get queue from mpd');
  mpd.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    _.map(data, function(song) {
      song.selected = false; // selected defaults to false    
      return song
    });
    // save queue to redis
    //redis.set([options.host, options.port, 'queue'].join[':'], JSON.stringify(data));
    return callback(null, data);
  });
}