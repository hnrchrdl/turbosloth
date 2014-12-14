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
      //this.autoScroll();
    }
    // fetch album cover
    if (this.data && ('Artist' in this.data) && this.data.Artist !== "" && 
          ('Album' in this.data) && this.data.Album !== "") {
      new LastAlbum(this.data.Artist, this.data.Album, function(err, album) {
        if (album && album.data) {
          var size = 2; // can be 0 to 5, from small to superlarge
          var url = album.getArtURL(size);
          if (url) { 
            $('#albumart').css('background-image', 'url(' + url + ')'); }
          else {
            $('#albumart').css('background-image', 'none');
          }
        }
      });
    }
    else {
      $('#albumart').css('background-image', 'none');
    }
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
      scrollable.animate({scrollTop: scrolltop}, 0);
    }
  }
};

//// Queue
// Constructor
var Queue = function(type, callback) {
  $('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var q = this;
  $.ajax({
    url:'/queue',
    data: {type: type}
  }).done(function(html) {
    q.html = html;
    callback(null, q);
  }).fail(function(jqXHR, err) {
    q.html = false;
    callback(jqXHR, {})
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
var Playlists = function(order, callback) {
  $('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var p = this;
  $.ajax({
    url: '/playlists/' + order,
  }).done(function(html){
    p.html = html;
    callback(null, p);
  }).fail(function(jqXHR, err){ 
    console.log(err);
    callback(err, {});
  });
};
// Prototypes
Playlists.prototype.render = function() {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.playlists').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
};


//// PlaylistDetails

// Constructor
var PlaylistDetails = function(playlist, callback) {
  var playlistDetails = this;
  $.ajax({
    url: '/playlistdetails/' + encodeURIComponent(playlist),
  }).done(function(html){
    playlistDetails.html = html;
    callback(null, playlistDetails);
  }).fail(function(jqXHR, err){ 
    console.log(jqXHR);
    callback(jqXHR, null);
  });
};
// Prototypes
PlaylistDetails.prototype.render = function() {
  //$('nav').find('.button').removeClass('active');
  //$('nav').find('.button.playlists').addClass('active');
  $('main').find('#playlists .cover').html('');
  $('main').find('#playlists .cover').append(this.html);
  $('main').find('#playlists .cover').fadeIn();
  //fixScrollHeight();
};




//// Browse

// Constructor
var Browse = function(folder, order, callback) {
  $('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var b = this;
  $.ajax({
    url: 'browse/' + encodeURIComponent(folder) + '/' + order
  }).done(function(html) {
    b.html = html;
    callback(null, b);  
  }).fail(function(jqXHR, err) {
    callback(err, {});
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


/*// Constructor
var Search = function(searchString, searchType, callback) {
  //$('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var s = this;
  $.ajax({
    url: 'search'
  }).done(function(html) {
    s.html = html;
    callback(null, s);  
  }).fail(function(jqXHR, err) {
    callback(err, {});
  });
};

// Prototypes
Search.prototype.render = function(html) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.search').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
  var searchString = $('#search').find('input.search-input').val();
  $('#search').find('input.search-input').val("");
  $('#search').find('input.search-input').focus();
  var val = $('#search').find('input.search-input').val(searchString);
  var e = jQuery.Event("keyup"); // trigger keyup event on input field
  $('#search').find('input.search-input').trigger(e);
};*/


//// FuzzySearch

// Constructor
/*var FuzzySearch = function(searchString, searchType, callback) {
  $('.scrollable').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var s = this;
  $.ajax({
    url: 'fuzzysearch/' + encodeURIComponent(searchString) + "/" + searchType
  }).done(function(html) {
    s.html = html;  
    callback(null, s);
  }).fail(function(jqXHR, err) {
    callback(err, {});
  });
};
// Prototypes
FuzzySearch.prototype.render = function(html) {
  searchScrollable = $('#search > .scrollable');
  if (searchScrollable.length > 0) {
    searchScrollable.html(this.html);
    fixScrollHeight();
  }
};*/


//// ArtistDetails

//Constructor
/*var ArtistDetails = function(artist, callback) {
  $('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  var a = this;
  $.ajax({
    url: 'artistdetails/' + encodeURIComponent(artist)
  }).done(function(html) {
    a.html = html;
    a.name = artist;
    return callback(null, a);  
  }).fail(function(jqXHR, err) {
    console.log(jqXHR);
    return callback(err, {});
  });
};
// Prototypes
ArtistDetails.prototype.render = function() {
  // render
  var artist_name = this.name;
  $('main').html('<div class="loading-wrapper"><i class="fa fa-circle-o-notch fa-spin loading"></i></div>');
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.search').addClass('active');
  $('main').html(this.html);
  fixScrollHeight();
  return true;
};*/

ArtistDetails.prototype.lastArtist = function() {
  // get Artist Info
  new LastArtist(this.name, function(err, artist) {
    if (artist && artist.data) {
      var artistImageUrl = artist.getImageURL(3);
      $('main > #artistdetails > .scrollable > .artist-image').css('background-image', 'url(' + artistImageUrl + ')');
      $('main > #artistdetails > .scrollable > .artist-image').show();
      var genre = artist.getGenre();
      $('main > #artistdetails > .scrollable > .artist-info > .genre').html(genre);
      var bio = artist.getBio();
      $('main > #artistdetails > .scrollable > .artist-info > .bio').html(bio);
      $('main > #artistdetails > .scrollable > .artist-info').show();
    }
    fixScrollHeight();
  });
  return true;
};

// Last Album
ArtistDetails.prototype.lastAlbum = function() {
  // get the Album Covers
  var artist = this;
  $('main > #artistdetails > .scrollable > .albums > .album-container').each(function(index, value) {
    var albumContainer = $(this);
    var album_name = albumContainer.attr('data-name');
    new LastAlbum(artist.name, album_name, function(err, album) {
      if (album && album.data) {
        var url = album.getArtURL(2) || "";
        albumContainer.css('background-image', 'url(' + url + ')');
        var url = album.getArtURL(3) || "";
        $('main').find('#artistdetails > .cover > .album-container[data-name="' + album_name + '"] > .leftside > .album-art')
            .css('background-image', 'url(' + url + ')');
      }
      if (err) {
        console.log(err);
      }
    });
  });
  return true;
};

// Last Similar
ArtistDetails.prototype.lastSimilar = function() {
  // get similar artists
  new LastSimilar(this.name, 20, function(err, similar) {
    if (similar && similar.data) {
      var artists = similar.get();
      $.each(artists, function(index, artist) {
        var artistImageUrl = artist.image[2]['#text'];
        var el_container = $('<div></div>')
            .attr('data-artist', artist.name)
            .addClass('artist-container')
            .css('background-image', 'url(' + artistImageUrl + ')');
        var el = $('<div></div>')
            .html(artist.name)
            .addClass('artist')
            .appendTo(el_container);
        $('main > #artistdetails > .scrollable > .similar').append(el_container);
        fixScrollHeight();
      });
    }
    else {
      $('main > #artistdetails > .scrollable > .similar').hide();
    }
  });
  return true;  
};
//Last Top Albums
ArtistDetails.prototype.lastTopAlbums = function() {
  // Top Albums
  new LastTopAlbums(this.name, function(err, topAlbums) {
    var albums = topAlbums.get();
    if (albums) {
      $.each(albums, function(index, album) {
        try {
          var albumImageUrl = album.image[2]['#text'];
        }
        catch(e) {
          console.log(e);
          var albumImageUrl = ""; 
        }
        //var albumYear = album.
        var el_container = $('<div></div>')
            .addClass('album-container')
            .css('background-image', 'url(' + albumImageUrl + ')');
        var el = $('<div></div>')
            .html(album.name.length < 30 ? album.name : album.name.slice(0,29) + "...")
            .addClass('album')
            .appendTo(el_container);
        $('main > #artistdetails > .scrollable > .albums-other').append(el_container);
        fixScrollHeight();
      });
    }
    else {
      $('main > #artistdetails > .scrollable > .albums-other > .head').html('Top Albums not found');
    }
  });
  return true;
};




//// mixed functions

function removeSongFromQueue(songId, callback) 
{
  var deleted = 0; 
  var i = 0;

  socket.emit('mpd', 'deleteid', [songId], function(err, msg) {
    if (err) {
      i += 1;
      if (i < 3) { // try 3 times, then give up
        setTimeout(function() {
          removeSongFromQueue(songId);
        }, 200);
      }
      else {
        return callback(false);
      }
    }
    else {
      return callback(true);
    }
  });
}

function playNext(songPos,callback) 
{
  // move to -1 to move it to the current song 
  socket.emit('mpd', 'move', [songPos, -1], function(err, msg) {
    if (err) {
      return callback(false);
    }
    else {
      return callback(true);
    }
  });
}

function addSongToPlaylist(songPath, playlist, callback) {
  socket.emit('mpd', 'playlistadd', [playlist, songPath], function(err, msg) {
  if (err) {
      return callback(false);
    }
    else {
      return callback(true);
    }
  });
}