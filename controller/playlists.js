var playlists = require('../models/playlists');

/**
*** get the Playlists from the model and render it
**/
module.exports.renderPlaylists = function(req, res) {
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
};

/**
*** get Playlist Details from the model and render it
**/
module.exports.renderPlaylistDetails = function(req, res) {
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
};
