var express = require('express'),
    router = express.Router(),
    komponist = require('../lib/komponist');

var secondsToTimeString = function (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

//// get /
router.get('/', function(req, res) {
  if (req.session.mpdhost && req.session.mpdport) {
      var sessionID = req.sessionID,
          port = req.session.mpdport,
          host = req.session.mpdhost,
          password = req.session.mpdpassword;

    var komponistClientExists = komponist.init(sessionID,port,host,password);
    if (password !== "") {
      komponist.authenticate(sessionID, password);
    }
    if (!komponistClientExists) {
      console.log('registering komponist changes');
      komponist.registerChange(sessionID);
    }

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

  else { // if no session is found
    res.render('login', { title: 'turbosloth :: login'});
  }
});

//// post to /
router.post('/', function(req, res) {
  req.session.mpdhost = req.body.mpdhost || undefined;
  req.session.mpdport = req.body.mpdport || undefined;
  req.session.mpdpassword = req.body.mpdpassword || undefined;
  req.session.streamurl = req.body.streamurl || undefined;
  res.redirect('/');
});

//// get /queue
router.get('/queue', function(req, res) {
  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.playlistinfo(function(err, data) {

    data = Object.keys(data[0]).length === 0 ? undefined : data;
    err ?
        res.render('queue',{queue:err, secondsToTimeString:secondsToTimeString}) :
        res.render('queue',{queue :data, secondsToTimeString:secondsToTimeString});
  }); 
});

// get /playlists
router.get('/playlists', function(req, res) {
  var komponistClient = komponist.getClient(req.sessionID);
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
    console.log(entry);
    req.session.url = req.session.url.slice(0,entry+1);
    url = req.session.url.join('/');
  } else { // get url from uri
    req.session.url = url.split('/');
  }
  
  var komponistClient = komponist.getClient(req.sessionID);
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
    
    var komponistClient = komponist.getClient(req.sessionID);
    komponistClient.search(type, searchString, function(err, contents) {
      if (err) { console.log(err); }
      else if (Object.keys(contents[0]).length === 0) { // if object is empty
        contents = null;
      }
      req.session.type = type;
      req.session.search = searchString;
      res.render('search', {contents: contents, 
          searchString:searchString, 
          type: type, 
          secondsToTimeString:secondsToTimeString});
    });
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
