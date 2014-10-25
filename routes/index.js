var express = require('express'),
    router = express.Router(),
    komponist = require('../lib/komponist');

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

    data = Object.keys(data[0]).length === 0 ? undefined : data;
    err ?
        res.render('playlists', {playlists:err}) : 
        res.render('playlists', {playlists:data});
  });
});

//// route get /browse
router.get('/browse/:url', function(req, res) {
  var url = decodeURIComponent(req.params.url);
  if (!req.session.url) { // no session, restart browse component
    req.session.url = [""];
    url = "";
  } else if (url === "#") { // restart browse compoent, get url from session
    url = req.session.url.join('/');
  }
  else if (url.substr(0,2) === "--") { // breadcrumb hit
    var entry = url.substr(2,3);
    req.session.url = req.session.url.slice(0,entry+1);
    url = req.session.url.join('/');
  } else { // get url from uri
    req.session.url = url.split('/');
  }
  
  var mpdNamespace = req.session.mpdhost + ":" + req.session.mpdport;
  var komponistClient = komponist.getClient(mpdNamespace);
  komponistClient.lsinfo([url], function(err,contents) {
    if (err) { console.log(err); }
    else {
      var dirs = [], files = [];
      // if contents contains only 1 item, mpd returns Object instead of Array
      // maybe write a pull request for komponist?
      contents = (contents instanceof Array) ? contents : [contents];

      for (i in contents) {
        var obj = contents[i];
        if ('directory' in obj) { // handle directory element
          var name_dir = obj.directory.split('/');
          obj.name = name_dir[name_dir.length-1];
          dirs.push(obj); //push item into dirs array
        } else if ('file' in obj) { // handle directory element
          var name_dir = obj.file.split('/');
          obj.name = name_dir[name_dir.length-1];
          files.push(obj); //push item into files array
        }
      }
    }
    res.render('browse', {dirs:dirs, files:files, url_array:req.session.url});
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

//// get /logout
router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = {
  router: router
}
