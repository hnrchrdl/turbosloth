var playlists = require('../models/playlists');

module.exports = {
  getList: getList,
  getByName: getByName
}



////////////////////////////////////////////////


/* respond with a list of all playlists as json */

function getAll(req,res) {
  
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'listplaylists',
    args: []
  }
  
  playlists.fetchAllFromMpd(options, function(err, data){
    return res.json({err: err, playlists:data});
  });
}


/* respond with details of a specific playlists as json */

function getByName(req,res) {
  var name = req.params.name;
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'listplaylistinfo',
    args: [name]
  }
  playlists.fetchDetailsFromMpd(options, function(err, data){
    return res.json({err: err, playlists: data});
  });
}






///// old stuff /////////////////////////////


/**
*** get the Playlists from the model and render it
**/
function renderPlaylists(req, res) {
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'listplaylists',
    args: []
  }
  playlists.fetchAllFromMpd(options, function(err, data){
    if (err) return res.render('playlists', {playlists:{}});
    return res.render('playlists', {playlists:data});
  });
}


/**
*** get Playlist Details from the model and render it
**/
function renderPlaylistDetails(req, res) {
  var playlist = decodeURIComponent(req.params.playlist);
  var options = {
    sessionID: req.sessionID,
    host: req.session.mpdhost,
    port: req.session.mpdport,
    password: req.session.mpdpassword,
    cmd: 'listplaylistinfo',
    args: [playlist]
  }
  playlists.fetchDetailsFromMpd(options, function(err, data) {
    res.render('playlistdetails', {playlist: playlist, contents: data});
  });
}
