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
    
    var komponistInit = komponist.init(port, host, password, function(err, obj) {
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
  var komponistClient = komponist.getClient(mpdNamespace);
  if (komponistClient) {
    komponistClient.playlistinfo(function(err, data) {
      data = Object.keys(data[0]).length === 0 ? undefined : data;
      err ?
        res.render('queue',{queue: err}) :
        res.render('queue',{queue :data});
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
  var komponistClient = komponist.getClient(mpdNamespace);
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

//// route get /browse
router.get('/browse/:browsepath/:order', function(req, res) {
  console.log(decodeURIComponent(req.params.browsepath));
  console.log(req.params.order);
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
  var komponistClient = komponist.getClient(mpdNamespace);
  if (komponistClient) {
    console.log(browsepath);
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
          }
          if (order === 'lastmodified') {
            try {
              contents.sort(SortByLastModified).reverse();
            } catch(e) {
              console.log(e);
            }
          }
        }
        for (i in contents) {
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
router.get('/search/:searchString/:type', function(req, res) {
  var searchString = decodeURIComponent(req.params.searchString);
  var type = req.params.type;
  
  if (!req.session.search && searchString === "#") { // empty search
    res.render('search', {contents: [], searchString:"", type: "Any"});
  }
  else if (req.session.search && searchString === "#") { // session search
    searchString = req.session.search;
    type = req.session.type; 
  }
  if (searchString !== "#") { // active search
    
    var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
    var komponistClient = komponist.getClient(mpdNamespace);
    if (komponistClient) {
      try {
        komponistClient.search(type, searchString, function(err, contents) {
          if (err) { 
            console.log(err);
            res.render('search', {contents: false,           
              searchString:'#', type: 'Any'
            });
          }
          else if (Object.keys(contents[0]).length === 0) { // if object is empty
            contents = false;
          }
          req.session.type = type;
          req.session.search = searchString;
          res.render('search', {contents: contents, 
              searchString:searchString, 
              type: type
          });
        });
      } catch (e) {
        res.render('search', {contents: false,           
          searchString:'#', type: 'Any'
        });
      }
    }
    else {
      req.session.destroy();
      res.redirect('/login?err=sessionLost');
    }
  }
});

//get lastfm album
router.get('/lastfmartist/:artist', function(req, res) {
  var artist = decodeURIComponent(req.params.artist);
  res.send(false);
});

//get lastfm album
router.get('/lastfmalbum/:artist/:album', function(req, res) {
  //lastfm.request(method, options);
  var request = lastfm.request("album.getInfo", {
    artist: req.params.artist,
    album: req.params.album,
    handlers: {
      success: function(data) {
        res.send(JSON.stringify(data));
      },
      error: function(error) {
        res.send(JSON.stringify({album:false}));
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
