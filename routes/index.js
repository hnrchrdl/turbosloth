var express = require('express')
  ,  router = express.Router()
  ,  komponist = require('../lib/komponist')
  ,  lastfm = require('../app').lastfm;

//This will sort your array
function SortByLastModified(a, b) {
  var aLastModified = a.lastmodified.toLowerCase();
  var bLastModified = b.lastmodified.toLowerCase();
  return ((aLastModified < bLastModified) ? -1 : ((aLastModified > bLastModified) ? 1 : 0));
}

//// get /login
router.get('/login', function(req, res) {
  res.render('login');
});
//// post to /login
router.post('/login', function(req, res) {
  req.session.mpdhost = req.body.mpdhost || undefined;
  req.session.mpdport = req.body.mpdport || undefined;
  req.session.mpdpassword = req.body.mpdpassword || undefined;
  req.session.streamurl = req.body.streamurl || undefined;
  res.redirect('/');
});

//// get /
router.get('/', function(req, res) {
  if (req.session.mpdhost && req.session.mpdport) {
    var sessionID = req.sessionID,
        port = req.session.mpdport,
        host = req.session.mpdhost,
        password = req.session.mpdpassword;
    
    var komponistInit = komponist.init(sessionID, host, port, password, function(err, obj) {
      if (err) {
        console.log('komponist init failed');
        req.session.destroy(); // logout
        console.log(err);
        res.redirect('/login?err='+err);
      }
      else {
        console.log('komponist init success!');
        
        if (req.session.streamurl === "") {
          req.session.streamurl = undefined;
        }
        //render skeleton
        res.render('skeleton', {
          title: 'turbosloth',
          mpdhost: req.session.mpdhost,
          mpdport: req.session.mpdport,
          stream: req.session.streamurl
        });
      }
    });
  }

  else { // if no session is found
    res.redirect('/login?err=nosession');
  }
});

//// get /queue
router.get('/queue', function(req, res) {
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(req.sessionID);
  if (komponistClient) {
    komponistClient.playlistinfo(function(err, data) {
      if (err) {
        console.log(err);
        res.render('queue',{queue: err});
      } else {
        res.render('queue',{queue :data});
      }
    });
  }
  else {
    req.session.destroy();
    res.redirect('/login?err=sessionLost');
  } 
});



// get /playlists
router.get('/playlists/:order', function(req, res) {
  var order = req.params.order;
  if (order === 'none' && req.session.playlistOrder) {
    order = req.session.playlistOrder;
  }
  else if (order === 'lastmodified') {
    req.session.playlistOrder = 'lastmodified';
  }
  else {
    order = 'name';
    req.session.playlistOrder = undefined;
  }
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(req.sessionID);
  if (komponistClient) {
    komponistClient.listplaylists(function(err, data) {
      if (err || Object.keys(data[0]).length === 0) {
        res.render('playlists', {playlists: undefined})
      }
      else {
        for (i in data) {
          if (data[i]['Last-Modified']) {
            data[i]['lastmodified'] = data[i]['Last-Modified'];
          }
          else {
              data[i]['lastmodified'] = '0000-00-00T00:00:00Z'; 
            }
        }
        if (order === 'lastmodified') {
          data.sort(SortByLastModified).reverse();
        }
        res.render('playlists', {playlists: data, order: order});
      }
    });
  }
  else {
    req.session.destroy();
    res.redirect('/login?err=sessionLost');
  }
});

router.get('/playlistdetails/:playlist', function(req, res) {
  var playlist = decodeURIComponent(req.params.playlist);
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.listplaylistinfo([playlist], function(err, contents) {
    if (err) {
      console.log(err);
      res.render('playlistdetails', {playlist: playlist, contents: null});
    }
    else {
      res.render('playlistdetails', {playlist: playlist, contents: contents}); 
    }
  })
});



//// route get /browse
router.get('/browse/:browsepath/:order', function(req, res) {
  var browsepath = decodeURIComponent(req.params.browsepath);
  if (browsepath === "#" && req.session.browsepath) {
    browsepath = req.session.browsepath;
  }
  else if (browsepath === '#') {
    browsepath = "";
    req.session.browsepath = "";
  }
  else if (browsepath[0] === '#') {
    req.session.breadcrumbs = req.session.breadcrumbs.splice(0,browsepath[1])
    browsepath = req.session.breadcrumbs.join('/');
    req.session.browsepath = browsepath;
  }
  else {
    req.session.browsepath = browsepath;
  }
  //sorting
  var order = req.params.order;
  if (order === 'none' && req.session.browseOrder) {
    order = req.session.browseOrder;
  }
  else if (order === 'lastmodified') {
    req.session.browseOrder = 'lastmodified';
  }
  else {
    order = 'name';
    req.session.browseOrder = undefined;
  }
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(req.sessionID);
  if (komponistClient) {
    komponistClient.lsinfo([browsepath], function(err, contents) {
      if (err) { 
        console.log(err); 
        res.render('browse', {dirs:[], files:[], breadcrumbs:false});
      }
      else {
        var dirs = [], files = [];
        // if contents contains only 1 item, mpd returns Object instead of Array
        contents = (contents instanceof Array) ? contents : [contents];
        if (contents.length > 1) {
          for (i in contents) {
            if (contents[i]['Last-Modified']) { 
              contents[i]['lastmodified'] = contents[i]['Last-Modified'];
            }
            else {
              contents[i]['lastmodified'] = '0000-00-00T00:00:00Z'; 
            }
            var item = contents[i];
            if ('directory' in item) { // handle directory element
              try {
                var dir_split = item.directory.split('/');
                item.name = dir_split[dir_split.length-1];
                if (item.name !== "") {
                  dirs.push(item); //push item into dirs array
                }
              }
              catch(e) {
                console.log(e);              
              }
            } else if ('file' in item) { // handle file element
              try {
                var dir_split = item.file.split('/');
                item.name = dir_split[dir_split.length-1];
                if (item.name !== "") {
                  files.push(item); //push item into files array
                }
              }
              catch(e) {
                console.log(e);              
              }
            }
          }
          if (order === 'lastmodified') {
            try {
              contents.sort(SortByLastModified).reverse();
            } catch(e) {
              console.log(e);
            }
          }
        }
        var breadcrumbs = browsepath.split('/');
        req.session.breadcrumbs = breadcrumbs;
        res.render('browse', {dirs:dirs, files:files, breadcrumbs:breadcrumbs, order: order});
      }
    });
  }
  else {
    req.session.destroy();
    res.redirect('/login?err=sessionLost');
  }
});

//// get search
// fuzzy
router.get('/fuzzysearch/:searchString/:type', function(req, res) {
  // searchString
  var searchString = decodeURIComponent(req.params.searchString);
  if (searchString === '#' && req.session.SearchString) {
    searchString = req.session.searchString;
  }
  else if (searchString !== '##') {
    req.session.searchString = searchString;
  }
  // searchType
  var type = req.params.type;
  if (type === 'none' && req.session.searchType) {
    type = req.session.searchType;
  }
  else if (type === 'none') {
    type = 'Artist';
  }
  else {
    req.session.searchType = type;
  }

  if (searchString === '#' || searchString === '##') { // empty Search
    res.render('fuzzysearch', {
      contents: {},
      searchString:searchString, 
      type: type
    });
  }
  else { // loaded Search
    var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
    var komponistClient = komponist.getClient(req.sessionID);

    if (komponistClient) {
      komponistClient.search(type, searchString, function(err, contents) {
        //console.log(contents);
        if (err || Object.keys(contents[0]).length === 0) { // if object is empty
          res.render('fuzzysearch', {
            contents: undefined, 
            searchString: searchString, 
            type: type
          });
        }
        else {
          if (type === 'Artist' || type === 'Album' || type === 'Title' || type === 'Genre') {  // group Results by Artist
            var artists = [];
            var results = [];
            for (i in contents) {
              var item = contents[i];
              if ('Artist' in item) {
                var artist_name = item.Artist;
                if (artists.indexOf(artist_name) === -1) {
                  artists.push(artist_name);
                  // get songs, albums and genres from the artist
                  var songcount = 0;
                  var albums = [];
                  var genres = [];
                  for (a in contents) {
                    var test_item = contents[a];
                    if ('Artist' in test_item) {
                      if (artist_name === test_item.Artist) {
                        songcount += 1;
                        if ('Album' in test_item) {
                          var album = test_item.Album;
                          if (albums.indexOf(album) === -1) {
                            albums.push(album);
                          } 
                        }
                        if ('Genre' in test_item) {
                          var genre = test_item.Genre;
                          if (genres.indexOf(genre) === -1) {
                            genres.push(genre);
                          }
                        }
                      }
                    }
                  }
                  results.push(
                    { artist : artist_name, 
                      songcount : songcount,
                      albumcount : albums.length,
                      albums : albums.join(', '),
                      genres : genres.join(', ') }
                  );
                  results.sort(function(a, b) {
                    return a.songcount-b.songcount;
                  }).reverse();
                }
              }
            }
            res.render('fuzzysearch', {
              contents: results,
              searchString:searchString, 
              type: type
            });
          } 
        }
      });
    }
  }
});

// exact search
router.get('/artistdetails/:artist', function(req, res){
  var artist = decodeURIComponent(req.params.artist);
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(req.sessionID);

  if (komponistClient) {
    komponistClient.find('Artist', artist, function(err, contents) {
      if (err) {
      console.log(err);
      }
      else {
        var album_names = [];
        albums = [];
        var others = [];
        for (i in contents) {
          var item = contents[i]; 
          if ('Album' in item) {
            var album_name = item.Album;
            if (album_names.indexOf(album_name) === -1) {
              album_names.push(album_name);
              albums.push({name: album_name, songs: [item]});
            }
            else {
              for (i in albums) {
                var album = albums[i];
                if (album_name === album.name) {
                  album.songs.push(item);
                } 
              }
            }
          }
          else {
            others.push(item);
          }
        }
        res.render('artistdetails', {
          songs: contents,
          albums: albums, 
          artist:artist
        });
      }
    });
  }
});

// the search container for the fuzzy search
router.get('/search', function(req, res) {
  search = "";
  type = 'Artist';
  if (req.session.searchString) {
    search = req.session.searchString;
  }
  if (req.session.searchType) {
    type = req.session.searchType
  }
  res.render('search', {search: search, type: type});
});

//get lastfm album
router.get('/lastfmartist/:artist', function(req, res) {
  var artist = decodeURIComponent(req.params.artist);
  var request = lastfm.request('artist.getInfo', {
    artist: artist,
    autocorrect: 1,
    handlers: {
      success: function(data) {
        res.json(data);
      },
      error: function(err) {
        res.json(null);
      }
    }
  });
});

//get lastfm album
router.get('/lastfmalbum/:artist/:album', function(req, res) {
  var artist = decodeURIComponent(req.params.artist);
  var album = decodeURIComponent(req.params.album);
  var request = lastfm.request("album.getInfo", {
    artist: artist,
    album: album,
    autocorrect: 1,
    handlers: {
      success: function(data) {
        res.json(data);
      },
      error: function(err) {
        res.json(null);
      }
    }
  });
});
//get lastfm album
router.get('/lastfmtopalbums/:artist', function(req, res) {
  var artist = decodeURIComponent(req.params.artist);
  var request = lastfm.request("artist.getTopAlbums", {
    artist: artist,
    autocorrect: 1,
    limit: 12,
    handlers: {
      success: function(data) {
        res.json(data);
      },
      error: function(err) {
        res.json(null);
      }
    }
  });
});

//get lastfm album
router.get('/lastfmsimilar/:artist/:quantity', function(req, res) {
  var artist = decodeURIComponent(req.params.artist);
  var request = lastfm.request("artist.getSimilar", {
    artist: artist,
    limit: parseInt(req.params.quantity),
    autocorrect: 1, 
    handlers: {
      success: function(data) {
        res.json(data);
      },
      error: function(err) {
        res.json(null);
      }
    }
  });
});

//// get /logout
router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = {
  router: router
}
