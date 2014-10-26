//// the Status
var Status = function(callback) {
  var status = this;
  socket.emit('mpd', 'status', [], function(err, obj) {
     if (obj && !isEmpty(obj)) {
      status.obj = obj;
    }
    else { status.obj = false; }
    return callback(err, status);
  });
};
Status.prototype.renderProgressBar = function() {
  var status = this.obj;
  var progressBar = $('#seek-bar');
  // start
  var start = function startProgressbar (songTime, elapsed) {
    var initial_width = elapsed / songTime * 100; 
    var duration = songTime - elapsed;
    progressBar
      .stop()
      .css('width',initial_width + '%')
      .animate({'width' : '100%'},duration * 1000, 'linear');
  };
  // stop
  var stop = function stopProgressBar () {
    progressBar.stop();
  };
  if (status) {
    switch (status.state) {
      case 'play':
        var songTime = parseFloat(status.time.split(":")[1]);
        var elapsed = parseFloat(status.elapsed);
        start(songTime, elapsed);
        break;
      case 'pause':
        stop();
        break;
      case 'stop':
        stop();
        progressBar.css('width',0);
    }
  }
};

// CurrentSong
var CurrentSong = function(callback) {
  var cs = this;
  socket.emit('mpd', 'currentsong', [], function(err, obj) {
    if (obj && !isEmpty(obj)) {
      cs.obj = obj;
    }
    else { cs.obj = false; }
    return callback(err, cs);
  });
}
CurrentSong.prototype.render = function() {
  var currentsong = $('#currentsong');
  if (this.obj && !isEmpty(this.obj)) {
    currentsong.html(this.obj.Artist + '<br>' + 
          this.obj.Title + '<br>' + 
          '<span class="muted">' + this.obj.Album + '</span>');
    var queue = $('main').find('#queue');
    if (queue && queue.length > 0) {
      this.showInQueue();
      this.autoScroll();
    }
    // fetch album cover
    new LastAlbum(this.obj.Artist, this.obj.Album, function(Album) {
      try { $('#albumart').css('background-image', 'url(' + Album.obj.album.image[3]['#text'] + ')'); }
      catch(e) { $('#albumart').css('background-image', 'none !important') }
    });
  }
  else {
    currentsong.html('<span class="muted">end of queue</span>');
  }
  //this.renderProgressBar();
};
CurrentSong.prototype.showInQueue = function() {
  if (this.obj) {
    var songs = $('#queue').find('.song');
    if (songs.length > 0) {
      songs.removeClass('active');
      songs.find('.attr.songpos').removeClass('active');
      songs.find('.queue-play').removeClass('active');
    }
    var current = $('#queue').find('.song.' + this.obj.Id);
    if (current.length > 0) {
      current.addClass('active');
      current.find('.attr.songpos').addClass('active');
      current.find('.attr.songpos').addClass('active');
      current.find('.queue-play').addClass('active');
    }
  }
};
CurrentSong.prototype.autoScroll = function() {
  if (this.obj) {
    var scrollable = $('#queue').find('.scrollable');
    if (scrollable && scrollable.length > 0) {
      var scrolltop = $('.song.' + this.obj.Id).offset().top +
          scrollable.scrollTop() -
          scrollable.offset().top;
      scrollable.animate({scrollTop: scrolltop}, 400);
    }
  }
};

//// Queue
// Constructor
var Queue = function(callback) {
  var q = this;
  $('nav').find('.loading.queue').show();
  $.ajax({
    url:'/queue'
  }).done(function(html) {
    q.html = html;
  }).fail(function(jqXHR, err) {
    q.html = false;
  }).always(function() {
    $('nav').find('.loading.queue').hide();
    callback(q)
  });
};
// Prototypes
Queue.prototype.render = function() {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.queue').addClass('active');
  if (this.html) {
    $('main').html(this.html);
  }
  fixScrollHeight();
  new CurrentSong(function(err, song) {
    if (song.obj) {
      song.showInQueue();
      song.autoScroll();
    }
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
  }).done(function(html) {
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
  }).done(function(html) {
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
