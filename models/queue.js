var komponist = require('../lib/komponist');
var redis = require('../lib/redis');


/**
* get the current playlist from mpd
* @param options {Object} 
* @param callback {Function}
*/
module.exports.getFromMpd = function(options, callback) {
  console.log('get queue from mpd');
  options.cmd = 'playlistinfo';
  options.args = [];
  komponist.fireCommand(options, function(err, data) {
    if (err) return callback(err, null);
    // save queue to redis
    redis.set([options.host, options.port, 'queue'].join[':'], JSON.stringify(data));
    return callback(null, data);
  });
}


/**
* get the current playlist from redis
* @param options {Object} 
* @param callback {Function}
*/
module.exports.getFromRedis = function(options, callback) {
  console.log('get queue from redis');
  redis.get([options.host, options.port, 'queue'].join[':'], function(err, data) {
    if (err) return callback(err, null);
    return callback(null, JSON.parse(data));
  })
}