var LastFmNode = require( 'lastfm' ).LastFmNode
var config = require( '../config.json' )[ 'lastfm' ];

/**
** create a new LastFmNode Object
** get the key and the secret from the configuration json in app folder
*/
module.exports = new LastFmNode({
  api_key : config.key,    // sign-up for a key at http://www.last.fm/api
  secret : config.secret,
  useragent : 'ts' // optional
});

//module.exports.client = client;