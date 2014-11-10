//// the Status
var Status = function(callback) {
  var s = this;
  socket.emit('mpd', 'status', [], function(err, data) {
     if (!err && data && !isEmpty(data)) {
      s.data = data;
    }
    else { s.data = false; }
    return callback(err, s);
  }); 
};
Status.prototype.renderProgressBar = function() {
  var progressBar = $('#seek-bar');
  var seekCurrent = $('#seek-current');
  var seekSongtime = $('#seek-songtime');

  // start
  setProgress = function(songTime, elapsed) {
    var initial_width = elapsed / songTime * 100; 
    var duration = songTime - elapsed;
    progressBar
      .stop()
      .css('width', initial_width + '%')
      //.animate({'width' : '100%'},duration * 1000, 'linear');
    seekSongtime.text(secondsToTimeString(songTime));
    seekCurrent.text(secondsToTimeString(elapsed));
  };
  // stop
  var stopProgress = function() {
    clearInterval(progressBar.data('progressIntervalID'));
    progressBar.removeData('progressIntervalID')
  };

  if (this) {
    if (this.data.time && this.data.elapsed) {
      var songTime = parseFloat(this.data.time.split(":")[1]);
      var elapsed = parseFloat(this.data.elapsed);
    }   
    switch (this.data.state) {
      case 'play':
        //stop();
        setProgress(songTime, elapsed);
        clearInterval(progressBar.data('progressIntervalID'));
        progressBar.data('progressIntervalID', setInterval(function() {
          elapsed += 1;
          setProgress(songTime, elapsed);
        }, 1000));
        break;
      case 'pause':
        stopProgress();
        setProgress(songTime, elapsed);
        break;
      case 'stop':
        stopProgress();
        setProgress(0, 0);
        progressBar.css('width',0);
    }
  }
};

// CurrentSong
var CurrentSong = function(callback) {
  var c = this;
  socket.emit('mpd', 'currentsong', [], function(err, data) {
    if (!err && data && !isEmpty(data)) {
      c.data = data;
    }
    else { c.data = false; }
    return callback(err, c);
  });
}
CurrentSong.prototype.render = function(callback) {
  var currentsong = $('#currentsong');
  if (this.data && !isEmpty(this.data)) {
    currentsong.html(this.data.Artist + '<br>' + 
          this.data.Title + '<br>' + 
          '<span class="muted">' + this.data.Album + '</span>');
    var queue = $('main').find('#queue');
    if (queue && queue.length > 0) {
      this.showInQueue();
      this.autoScroll();
    }
    // fetch album cover
    new LastAlbum(this.data.Artist, this.data.Album, function(err, album) {
      if (err) {
        console.log(err);
      }
      else {
        var size = 3; // can be 0 to 5, from small to superlarge
        var url = album.getAlbumArt(size);
        if (url) { $('#albumart').css('background-image', 'url(' + url + ')'); }
        else { $('#albumart').css('background-image', 'none') }
      }
    });
  }
  else {
    currentsong.html('<span class="muted">end of queue</span>');
    interfaceRegistration();
  }
};
CurrentSong.prototype.showInQueue = function() {
  if (this.data) {
    var songs = $('#queue').find('.item');
    if (songs.length > 0) {
      songs.removeClass('active');
      songs.find('.attr.songpos').removeClass('active');
    }
    var current = $('#queue').find('.item' + '[data-id="' + this.data.Id + '"]');
    if (current.length > 0) {
      current.addClass('active');
      current.find('.attr.songpos').addClass('active');
      current.find('.attr.songpos').addClass('active');
    }
  }
};
CurrentSong.prototype.autoScroll = function() {
  if (this.data) {
    var scrollable = $('#queue').find('.scrollable');
    var song = $('.item' + '[data-id="' + this.data.Id + '"]');
    if (scrollable && scrollable.length > 0 && song && song.length > 0) {
      var scrolltop = song.offset().top +
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
    if (song.data) {
      song.showInQueue();
      song.autoScroll();
    }
  });
  interfaceRegistration();
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
