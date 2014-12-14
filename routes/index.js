var express = require('express')
  , router = express.Router()
  , loginCtrl = require('../controller/login')
  , logoutCtrl = require('../controller/logout')
  , queueCtrl = require('../controller/queue')
  , playlistsCtrl = require('../controller/playlists')
  , browseCtrl = require('../controller/browse')
  , searchCtrl = require('../controller/search')
  , lastfmCtrl = require('../controller/lastfm');


/** 
*** Login / Logout
**/
router.get('/login', loginCtrl.renderLogin);
router.post('/login', loginCtrl.login, loginCtrl.redirectToStart);
router.get('/logout', logoutCtrl.logout);
router.get('/', loginCtrl.initMpd, loginCtrl.initStream, loginCtrl.renderSkeleton);


/** 
*** Queue
**/
router.get('/queue', queueCtrl.render);


/** 
*** Playlists
**/
router.get('/playlists', playlistsCtrl.renderPlaylists);
router.get('/playlist-details/:playlist', playlistsCtrl.renderPlaylistDetails);


/** 
*** Search
**/
router.get('/search-request', searchCtrl.renderRequest);
router.get('/artist-details', searchCtrl.renderArtistDetails); 


/** 
*** Browse
**/
router.get('/browse', browseCtrl.render);


/** 
*** LastFm
**/
router.get('/lastfm-artist', lastfmCtrl.getArtistDetails);
router.get('/lastfm-album', lastfmCtrl.getAlbumDetails);
router.get('/lastfm-topalbums', lastfmCtrl.getTopAlbums);
router.get('/lastfm-similar', lastfmCtrl.getSimilarArtists);



module.exports = {
  router: router
}
