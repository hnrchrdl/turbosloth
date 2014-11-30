var LastFmNode = require('lastfm').LastFmNode
var config = require('../config.json')['lastfm'];

var client = new LastFmNode({
  api_key: config.key,    // sign-up for a key at http://www.last.fm/api
  secret: config.secret,
  useragent: 'ts' // optional
});

module.exports.client = client;