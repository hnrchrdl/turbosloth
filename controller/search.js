var search = require( '../models/search' )


/**
*** render a Search Request
**/
module.exports.renderRequest = function( req, res ) {

  var searchstring = req.query.searchstring;
  var searchtype = req.query.searchtype;
  
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'search',
    args: [ searchtype, searchstring ]
  }

  search.searchRequest( options, function( err, data ) {
    res.render( 'searchrequest', {
      result: data,
      searchstring: searchstring, 
      searchtype: searchtype
    });
  });
};


/**
*** render Artist Details
**/
module.exports.renderArtistDetails = function( req, res ) {
  var artist = req.query.artist;
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'find',
    args: [ 'artist', artist ]
  }
  search.getArtistDetails( options, function( err, data ) {
    res.render( 'artistdetails', {
      songs: data.songs,
      albums: data.albums, 
      artist: artist
    });
  });
};


module.exports.search = function( req, res ) {

  var name = req.query.name;
  var type = req.query.type;

  if (name.length < 3) {
    return res.json({
      error: 'please enter 3 or more characters',
      results: null
    });
  }
  
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'search',
    args: [ type, name ]
  }

  search.searchRequest( options, function( err, data ) {
    if (err) return res.json({error: err});
    
    if (!data) {
      return res.json({
        error: 'sorry, no results found for ' + name,
        results: null
      });
    }
    return res.json({
      error: null,
      results: data
    });
  });

};