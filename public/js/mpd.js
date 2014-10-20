//// Aorta
// Constructor
var Aorta = function(callback) {
  //console.log('MpdAorta constructor called' );
  // Object with the current song and status
  var aorta = this;
  socket.emit('mpd', 'currentsong', [], function(err, data) {
    if (err) { console.log(err); }
    else{ aorta.song = data; }
    socket.emit('mpd', 'status', [], function(err, data) {
      if (err) { console.log(err); }
      else {aorta.status = data; }
      
      registerMpdInterface(aorta.status);
      
      callback(aorta);
    });
  });
};

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
