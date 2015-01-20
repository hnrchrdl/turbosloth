var lastfm = require('../lib/lastfm');

/**
*** get Artist Details from LastFm
**/
module.exports.getArtistDetails = function( req, res ) {
  var artist = req.params.artist;
  var request = lastfm.request('artist.getInfo', {
    artist : artist,
    autocorrect : 1,
    handlers : {
      success : function(data) {
        res.json(data);
      },
      error : function(err) {
        res.json(null);
      }
    }
  });
};


/**
*** get Album Details from LastFm
**/
module.exports.getAlbumDetails = function(req, res) {
  var artist = req.params.artist;
  var album = req.params.album;
  var request = lastfm.request('album.getInfo', {
    artist : artist,
    album : album,
    autocorrect : 1,
    handlers : {
      success : function(data) {
        res.json(data);
      },
      error : function(err) {
        res.json(null);
      }
    }
  });
};


/**
*** get Top Albums of any Artist from LastFm
**/
module.exports.getTopAlbums = function( req, res ) {
  var artist = req.params.artist;
  var limit = (typeof req.params.limit != 'undefined') ? 
     req.params.limit :
     12; // 12 is default
  var request = lastfm.request( 'artist.getTopAlbums', {
    artist : artist,
    autocorrect : 1,
    limit : limit,
    handlers: {
      success: function( data ) {
        res.json( data );
      },
      error: function( err ) {
        res.json( null );
      }
    }
  });
};



/**
*** get Similar Artist of any Artist from LastFm
**/
module.exports.getSimilarArtists = function( req, res ) {
  var artist = req.params.artist;
  var limit = (typeof req.params.limit != 'undefined') ? 
     req.params.limit :
     12; // 12 is default
  var request = lastfm.request( 'artist.getSimilar', {
    artist : artist,
    limit : limit,
    autocorrect : 1,
    handlers : {
      success : function(data) {
        res.json(data);
      },
      error : function(err)  {
        res.json(null);
      }
    }
  });
};