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
  komponistClient.playlistinfo(function(err, data) {

    data = Object.keys(data[0]).length === 0 ? undefined : data;
    err ?
        res.render('queue',{queue: err}) :
        res.render('queue',{queue :data});
  }); 
});

// get /playlists
router.get('/playlists', function(req, res) {
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(mpdNamespace);
  komponistClient.listplaylists(function(err, data) {
    if (err || Object.keys(data[0]).length === 0) {
      res.render('playlists', {playlists:false})
    }
    else {
      for (i in data) {
        data[i]['lastmodified'] = data[i]['Last-Modified'];
      }
      data.sort(SortByLastModified);
      res.render('playlists', {playlists: data});
    }
  });
});

//// route get /browse
router.get('/browse/:browsepath', function(req, res) {
  var browsepath = decodeURIComponent(req.params.browsepath);
  if (browsepath === "#") {
    browsepath = "";
  } else {
    if (browsepath[0] === '#') {
      req.session.breadcrumbs = req.session.breadcrumbs.splice(0,browsepath[1])
      browsepath = req.session.breadcrumbs.join('/');
    }
  }
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(mpdNamespace);
  komponistClient.lsinfo([browsepath], function(err,contents) {
    if (err) { 
      console.log(err); 
      res.render('browse', {dirs:[], files:[], breadcrumbs:false});
    }
    else {
      var dirs = [], files = [];
      // if contents contains only 1 item, mpd returns Object instead of Array
      contents = (contents instanceof Array) ? contents : [contents];
      
      for (i in contents) {
        var item = contents[i];
        if ('directory' in item) { // handle directory element
          var dir_split = item.directory.split('/');
          item.name = dir_split[dir_split.length-1];
          dirs.push(item); //push item into dirs array
        } else if ('file' in item) { // handle file element
          var dir_split = item.file.split('/');
          item.name = dir_split[dir_split.length-1];
          files.push(item); //push item into files array
        }
      }
      var breadcrumbs = browsepath.split('/');
      req.session.breadcrumbs = breadcrumbs;
      res.render('browse', {dirs:dirs, files:files, breadcrumbs:breadcrumbs});
    }
  });
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
