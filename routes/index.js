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
router.get('/api/queue', queueCtrl.get);


/** 
*** Search
**/
router.get('/search-request', searchCtrl.renderRequest);
router.get('/artist-details', searchCtrl.renderArtistDetails);
router.get('/api/artistsearch/:type/:name', searchCtrl.artistSearch);
router.get('/api/albumsearch/:name', searchCtrl.albumSearch);


/** 
*** Playlists
**/
router.get('/playlists', playlistsCtrl.renderPlaylists);
router.get('/playlist-details/:playlist', playlistsCtrl.renderPlaylistDetails);




/** 
*** Browse
**/
router.get('/browse', browseCtrl.render);


/** 
*** LastFm
**/
router.get('/api/lastfm/artist/:artist', lastfmCtrl.getArtistDetails);
router.get('/api/lastfm/album/:artist/:album', lastfmCtrl.getAlbumDetails);
router.get('/api/lastfm/topalbums/:artist/:limit', lastfmCtrl.getTopAlbums);
router.get('/api/lastfm/topalbums/:artist', lastfmCtrl.getTopAlbums);
router.get('/api/lastfm/similar/:artist/:limit', lastfmCtrl.getSimilarArtists);
router.get('/api/lastfm/similar/:artist', lastfmCtrl.getSimilarArtists);



module.exports = {
  router: router
}
