var lastfm = require('../lib/lastfm');

module.exports = {
  getArtistDetails: getArtistDetails,
  getAlbumDetails: getAlbumDetails,
  getTopAlbums: getTopAlbums,
  getSimilarArtists: getSimilarArtists
}



///////////////////////////////////////////////////


/* get Artist Details from LastFm */

function getArtistDetails(req, res) {
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
}


/* get Album Details from LastFm */

function getAlbumDetails(req, res) {
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
}


/* get Top Albums of any Artist from LastFm */

function getTopAlbums(req, res) {
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
        res.json(data);
      },
      error: function( err ) {
        res.json(null);
      }
    }
  });
}



/* get Similar Artist of any Artist from LastFm */

function getSimilarArtists(req, res) {
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
}
