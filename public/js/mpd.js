//// Aorta
// Constructor
var Aorta = function(callback) {
  //console.log('MpdAorta constructor called' );
  // Object with the current song and status
  var aorta = this;
  socket.emit('mpd', 'currentsong', [], function(err, data) {
    if (err) { 
      console.log(err);
      aorta.song = undefined;
    }
    else{ aorta.song = data; }
    socket.emit('mpd', 'status', [], function(err, data) {
      if (err) { 
        console.log(err);
        aorta.status = undefined;
      }
      else { aorta.status = data; }
      
      registerMpdInterface(aorta.status);
      
      callback(aorta);
    });
  });
};
// Prototypes
Aorta.prototype.renderCurrentSong = function() {
  var song = this.song;
  
  // display the currently playing song
  var currentsong = $('#left').find('.currentsong');
  if (status.state === 'stop') {
    currentsong.text("");
  }
  else {
    currentsong.html(song.Artist+ '<br>' + 
        song.Title + '<br>' + '<span class="muted">' + 
        song.Album + '</span>');
  }
  
  // fetch album cover
  //fetch_album_cover(song.Artist, song.Album, function(url) {
  //  console.log(url);
  //});

  this.highlightSongInQueue();
  this.renderProgressBar();
}
Aorta.prototype.highlightSongInQueue = function() {
  var song = this.song;
  
  $('#queue').find('.song').removeClass('active');
  $('#queue').find('.song').find('.attr.songpos').removeClass('active');
  $('#queue').find('.song.' + song.Id).addClass('active');
  $('#queue').find('.song.' + song.Id).find('.attr.songpos').addClass('active');
}
Aorta.prototype.renderProgressBar = function() {
  var status = this.status;
  
  var progressBar = $('#seek-bar');
  // start
  var start = function startProgressbar (songTime,elapsed) {
    var initial_width = elapsed / songTime * 100; 
    var duration = songTime - elapsed;
    progressBar
      .stop()
      .css('width',initial_width + '%')
      .animate({'width': '100%'},duration * 1000, 'linear');
  };
  // stop
  var stop = function stopProgressBar () {
    progressBar.stop();
  };

  switch (status.state) {
    case 'play':
      var songTime = parseFloat(status.time.split(":")[1]);
      var elapsed = parseFloat(status.elapsed);
      start(songTime,elapsed);
      break;
    case 'pause':
      stop();
      break;
    case 'stop':
      stop();
      progressBar.css('width',0);
  }
}

//// Queue
// Constructor
var Queue = function(callback) {
  var queue = this;
  $.ajax({
    url:'/queue'
  }).success(function(data) {
    queue.html = data;
    callback({}, queue);  
  }).fail(function(err) {
    callback(err, {});
  });
}
// Prototypes
Queue.prototype.render = function(html) {
    $('nav').find('.loading.queue').show();
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.queue').addClass('active');
    $('main').html(this.html);
    fixScrollHeight();
    $('nav').find('.loading.queue').hide();
    // highlight current song in playlist
    socket.emit('mpd', 'currentsong', [], function(err, song) {
      highlightSongInQueue(song);
    });
};
var Playlists = function(callback) {
  var playlists = this;
  $.ajax({
    url:'/playlists'
  }).success(function(data) {
    playlists.html = data;
    callback({}, playlists);  
  }).fail(function(err) {
    callback(err, {});
  });
}
// Prototypes
Queue.prototype.render = function(html) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.queue').addClass('active');
}

//// Browse
// Constructor
var Browse = function(callback) {
  var playlists = this;
  $.ajax({
    url:'/browse'
  }).success(function(data) {
    browse.html = data;
    callback({}, browse);  
  }).fail(function(err) {
    callback(err, {});
  });
}
// Prototypes
Browse.prototype.render = function(html) {
  
}

//// Search
// Constructor
var Search = function(callback) {
  var playlists = this;
  $.ajax({
    url:'/search'
  }).success(function(data) {
    search.html = data;
    callback({}, search);  
  }).fail(function(err) {
    callback(err, {});
  });
}
// Prototypes
Search.prototype.render = function(html) {
  
}
