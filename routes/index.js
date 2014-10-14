var express = require('express'),
  router = express.Router(),
  komponist = require('../lib/komponist');
  //socket = require('../lib/sockets');


//  ******************
//  *** the routes ***

// route for getting of /
router.get('/', function(req, res) {

  if (req.session.mpdhost && req.session.mpdport) {
    
    var sessionID = req.sessionID,
      port = req.session.mpdport,
      host = req.session.mpdhost,
      password = req.session.mpdpassword;
      //console.log(password);

    var komponistClientExists = komponist.init(sessionID,port,host,password);
    if (password !== "") {
      komponist.authenticate(sessionID, password);
    }
    if (!komponistClientExists) {
      komponist.registerChange(sessionID);
    }

      // register mpd listener for -changed- event
      
    var stream = (req.session.streamport === "") ?  
        req.session.streamurl : 
        req.session.streamurl + ':' + req.session.streamport;
    //console.log('stream: ' + stream);

    //render skeleton
    res.render('skeleton', { 

      title: 'turbosloth', 
      mpdhost: req.session.mpdhost,
      mpdport: req.session.mpdport,
      stream: stream
    });
  }

  // if no session is found
  else {
    res.render('login', { title: 'login'});
  }
});

// route for posting to /
router.post('/', function(req, res) {

  req.session.mpdhost = req.body.mpdhost;
  req.session.mpdport = req.body.mpdport;
  req.session.mpdpassword = req.body.mpdpassword;
  req.session.streamurl = req.body.streamurl;
  req.session.streamport = req.body.streamport;
  res.redirect('/');
});

// route for getting of /mpdplaylist
router.get('/mpdplaylist', function(req,res) {

  var secondsToTimeString = function (seconds) {

    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }
  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.playlistinfo(function(err, data) {
    //for (i in data) {
      //console.log(data[i]);
    //} 

    res.render('playlist',{playlist:data,secondsToTimeString:secondsToTimeString});
  }); 
});

// route for getting of /manageplaylist
router.get('/manageplaylist', function(req,res) {

  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.listplaylists(function(err,data) {
    //console.log(data);
    res.render('managePlaylist', {playlists:data});
  });
});

// route for getting of /browse
router.get('/browse/:url', function(req,res) {
  var url = decodeURIComponent(req.params.url);
  
  if (!req.session.url) {
    // no session, restart browse component
    req.session.url = [""];
    url = "";
  } else if (url === "#") {
    // restart browse compoent, get url from session
    url = req.session.url.join('/');
  }
  else if (url.substr(0,2) === "--") {
    // breadcrumb hit
    var entry = url.substr(2,3);
    console.log(entry);
    req.session.url = req.session.url.slice(0,entry+1);
    url = req.session.url.join('/');
  } else {
    // get url from uri
    req.session.url = url.split('/');
  }
  
  var komponistClient = komponist.getClient(req.sessionID);
  komponistClient.lsinfo([url], function(err,contents) {
    console.log(err);
    if (contents) {
      var dirs = []
        , files = [];

      // if contents contains only 1 item, mpd returns Object instead of Array
      contents = (contents instanceof Array) ? contents : [contents];
      
      for (i in contents) {
        var obj = contents[i];
        //console.log(obj);
        if ('directory' in obj) {
          console.log(obj);
          var name_dir = obj.directory.split('/');
          obj.name = name_dir[name_dir.length-1];
          dirs.push(obj);
        } else if ('file' in obj) {
          var name_dir = obj.file.split('/');
          obj.name = name_dir[name_dir.length-1];
          files.push(obj);
        }
      }
    }
    //console.log(data);
    res.render('browse', {dirs:dirs, files:files, url_array:req.session.url});
  });
});

router.get('/search/:searchString/:type', function(req,res) {
  var searchString = decodeURIComponent(req.params.searchString);
  var type = req.params.type;
  
  if (!req.session.search && searchString === "#") {
    res.render('search', {contents: [], searchString:"", type: "Any"});
  }
  else if (req.session.search && searchString === "#") {
    searchString = req.session.search;
    type = req.session.type; 
  }
  if (searchString !== "#") {
    var secondsToTimeString = function (seconds) {
      var date = new Date(1970,0,1);
      date.setSeconds(seconds);
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    }
    var komponistClient = komponist.getClient(req.sessionID);
    komponistClient.search(type, searchString, function(err,contents) {
      if (Object.keys(contents[0]).length === 0) {
        contents = null;
      }
      req.session.type = type;
      req.session.search = searchString;
      console.log(req.session.type);
      console.log(req.session.search);
      res.render('search', {contents: contents, 
          searchString:searchString, 
          type: type, 
          secondsToTimeString:secondsToTimeString});
    });
  }
});

// route for getting of /logout
router.get('/logout', function(req,res) {

  req.session.destroy();
  res.redirect('/');
});

module.exports = {
  router: router
}
//module.exports = router;