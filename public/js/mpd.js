var Aorta = function(callback) {
  //console.log('MpdAorta constructor called' );
  // Object with the current song and status
  var aorta = this;
  socket.emit('mpd', 'currentsong', [], function(err, data) {
    aorta.song = err ? err : data;
    socket.emit('mpd', 'status', [], function(err, data) {
      aorta.status = err ? err : data;
      callback(aorta);
    });
  });
};

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
