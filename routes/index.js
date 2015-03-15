var express = require('express')
  , router = express.Router()
  , userCtrl = require('../controller/userCtrl')
  , loginCtrl = require('../controller/login')
  , logoutCtrl = require('../controller/logout')
  , statusCtrl = require('../controller/status')
  , songCtrl = require('../controller/song')
  , queueCtrl = require('../controller/queue')
  , searchCtrl = require('../controller/search')
  , playlistsCtrl = require('../controller/playlists')
  , browseCtrl = require('../controller/browse')
  , mpdCtrl = require('../controller/mpdCtrl')
  , lastfmCtrl = require('../controller/lastfm');




/* User */

//router.get('/api/user/login', userCtrl.login);
//router.get('api/user/logout', userCtrl.logout);
//router.get('api/user/authenticate, userCtrl.authenticate);




/* Login * Logout */

router.get('/login', loginCtrl.renderLogin);
router.post('/login', loginCtrl.login, loginCtrl.redirectToStart);
router.get('/logout', logoutCtrl.logout);
router.get('/', loginCtrl.initMpd, loginCtrl.initStream, loginCtrl.renderSkeleton);


/* Song and Status */
router.get('/api/mpd/song', songCtrl.getSong);
router.get('/api/mpd/status', statusCtrl.getStatus);

/* Queue */

//router.get('/queue', queueCtrl.render);
router.get('/api/queue', queueCtrl.get);



/* Search */

//router.get('/search-request', searchCtrl.renderRequest);
//router.get('/artist-details', searchCtrl.renderArtistDetails);
router.get('/api/search/albums/:artist', searchCtrl.albumSearch);
router.get('/api/search/:type/:name', searchCtrl.search);




/* Playlists */

//router.get('/playlists', playlistsCtrl.renderPlaylists);
//router.get('/playlist-details/:playlist', playlistsCtrl.renderPlaylistDetails);
router.get('/api/playlists', playlistsCtrl.getAll);
router.get('/api/playlists/:name', playlistsCtrl.getByName);




/* Browse */

//router.get('/browse', browseCtrl.render);
//router.get('/api/browse/:path', browseCtrl.browse);
router.get('/api/browse', browseCtrl.browse);




/* Mpd */

router.get('api/mpd/getList', mpdCtrl.getList)
router.post('api/mpd/select', mpdCtrl.select);
router.post('api/mpd/test', mpdCtrl.test);
router.post('api/mpd/save', mpdCtrl.save);




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
