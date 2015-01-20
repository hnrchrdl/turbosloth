var express = require('express')
  , router = express.Router()
  , loginCtrl = require('../controller/login')
  , logoutCtrl = require('../controller/logout')
  , queueCtrl = require('../controller/queue')
  , playlistsCtrl = require('../controller/playlists')
  , browseCtrl = require('../controller/browse')
  , searchCtrl = require('../controller/search')
  , lastfmCtrl = require('../controller/lastfm');
  
  

/* Login * Logout */

router.get('/login', loginCtrl.renderLogin);
router.post('/login', loginCtrl.login, loginCtrl.redirectToStart);
router.get('/logout', logoutCtrl.logout);
router.get('/', loginCtrl.initMpd, loginCtrl.initStream, loginCtrl.renderSkeleton);



/* Queue */

//router.get('/queue', queueCtrl.render);
router.get('/api/queue', queueCtrl.get);



/* Search */

//router.get('/search-request', searchCtrl.renderRequest);
//router.get('/artist-details', searchCtrl.renderArtistDetails);
router.get('/api/search/artist/:type/:name', searchCtrl.artistSearch);
router.get('/api/search/albums/:artist', searchCtrl.albumSearch);



/* Playlists */

//router.get('/playlists', playlistsCtrl.renderPlaylists);
//router.get('/playlist-details/:playlist', playlistsCtrl.renderPlaylistDetails);
router.get('/api/playlists', playlistCtrl.getList);
router.get('/api/playlist/:name', playlistCtrl.getByName);




/* Browse */

//router.get('/browse', browseCtrl.render);
router.get('/api/browse/:path', browseCtrl.browse);
router.get('/api/browse/', browseCtrl.browse);



/* LastFm */

router.get('/api/lastfm/artist/:artist', lastfmCtrl.getArtistDetails);
router.get('/api/lastfm/album/:artist/:album', lastfmCtrl.getAlbumDetails);
router.get('/api/lastfm/topalbums/:artist/:limit', lastfmCtrl.getTopAlbums);
router.get('/api/lastfm/topalbums/:artist', lastfmCtrl.getTopAlbums);
router.get('/api/lastfm/similar/:artist/:limit', lastfmCtrl.getSimilarArtists);
router.get('/api/lastfm/similar/:artist', lastfmCtrl.getSimilarArtists);



module.exports = {
  router: router
}
