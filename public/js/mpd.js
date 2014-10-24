//// Aorta
// Constructor
var Aorta = function(callback) {
  //console.log('MpdAorta constructor called' );
  // Object with the current song and status
  var a = this;
  socket.emit('mpd', 'currentsong', [], function(err, song) {
    if (err) { 
      console.log('error fetching current song: ' + err);
      a.song = undefined;
    }
    else { a.song = song; }
    console.log(a.song);
    socket.emit('mpd', 'status', [], function(err, status) {
      if (err) { 
        console.log('error fetching status: ' + err);
        a.status = undefined;
        console.log(a.status);
      }
      else { a.status = status; }
      if (a.status && a.song) {
        registerMpdInterface(a.status);
        callback(a);
      }
    });
  });
};
// Prototypes
Aorta.prototype.renderCurrentSong = function() {
  
  var song = this.song;
  var status = this.status;
  var currentsong = $('#currentsong');
  if (song) {
    try {
      // display the currently playing song
      currentsong.html(song.Artist + '<br>' + 
            song.Title + '<br>' + 
            '<span class="muted">' + song.Album + '</span>');
      this.highlightSongInQueue();
      this.renderProgressBar();
    }
    catch(err) {
      console.log(err);
      showInfo("error showing current song ", 5000);
    }
  }
  else {
    currentsong.text("");
  }
  // fetch album cover
  //fetch_album_cover(song.Artist, song.Album, function(url) {
  //  console.log(url);
  //});
};
Aorta.prototype.highlightSongInQueue = function() {
  var song = this.song;
  if (song) {
    try {
      $('#queue').find('.song').removeClass('active');
      $('#queue').find('.song').find('.attr.songpos').removeClass('active');
      $('#queue').find('.song.' + song.Id).addClass('active');
      $('#queue').find('.song.' + song.Id).find('.attr.songpos').addClass('active');
    } 
    catch (err) {
      console.log(err);
      showInfo("error highlighting song in queue ", 5000);
    }
  }
};
Aorta.prototype.scrollToCurrentSong = function() {
  var song = this.song;
  if (song) {
    try {
      var scrollable = $('#queue').find('.scrollable');
      var scrolltop = $('.song.' + song.Id).offset().top +
          scrollable.scrollTop() -
          scrollable.offset().top;
      scrollable.animate({scrollTop: scrolltop}, 0);
    }
    catch (err) { 
      console.log(err);
      showInfo("error scrolling to current song", 5000);
    }
  }
};
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
  try {
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
  } catch(err) { console.log(err); }
  }
};

//// Queue
// Constructor
var Queue = function(callback) {
  var q = this;
  $('nav').find('.loading.queue').show();
  $.ajax({
    url:'/queue'
  }).success(function(html) {
    q.html = html;
    callback({}, q);
  }).fail(function(jqXHR, err) {
    callback(err, {});
  }).always(function() {
    $('nav').find('.loading.queue').hide();
  });
};
// Prototypes
Queue.prototype.render = function() {
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.queue').addClass('active');
    $('main').html(this.html);
    fixScrollHeight();
    // highlight current song in playlist
    new Aorta(function(a) {
      a.highlightSongInQueue();
      a.scrollToCurrentSong();
    }); 
};

//// Playlists
// Constructor
var Playlists = function(callback) {
  var p = this;
  $('nav').find('.loading.playlists').show();
  $.ajax({
    url: '/playlists'
  }).done(function(html){
    p.html = html;
    callback({}, p);
  }).fail(function(jqXHR, err){ 
    console.log(err);
    callback(err, {});
  }).always(function() {
    $('nav').find('.loading.playlists').hide();
  });
};
// Prototypes
Playlists.prototype.render = function() {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.playlists').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
};

//// Browse
// Constructor
var Browse = function(folder, callback) {
  var b = this;
  $('nav').find('.loading.browse').show();
  $.ajax({
    url: 'browse/' + encodeURIComponent(folder)
  }).success(function(html) {
    b.html = html;
    callback({}, b);  
  }).fail(function(jqXHR, err) {
    callback(err, {});
  }).always(function() {
    $('nav').find('.loading.browse').hide();
  });
};
// Prototypes
Browse.prototype.render = function(html) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.browse').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
};

//// Search
// Constructor
var Search = function(searchString, searchType, callback) {
  var s = this;
  $('nav').find('.loading.search').show();
  $.ajax({
    url: 'search/' + encodeURIComponent(searchString) + "/" + searchType
  }).success(function(html) {
    s.html = html;
    callback({}, s);  
  }).fail(function(jqXHR, err) {
    callback(err, {});
  }).always(function() {
    $('nav').find('.loading.search').hide();
  });
};
// Prototypes
Search.prototype.render = function(html) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.search').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
};
