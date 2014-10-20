////// static
//// nav top
// logout
$('#logout').on('click', function(){
  window.location = '/logout';
});

//// nav main left
// queue
$('.button.queue').on('click', function(){
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.queue').addClass('active');
  $('nav').find('.loading.queue').show();
  var init = true;
  renderAorta(init);
});

// playlists
$('.button.playlists').on('click', function(){
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.playlists').addClass('active');
  $('nav').find('.loading.playlists').show();
  renderPlaylists();
});

// browse
$('.button.browse').on('click', function(){
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.browse').addClass('active');
  renderBrowse("#");
});

// search
$('.button.search').on('click', function(){
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.search').addClass('active');
  $('nav').find('.loading.search').show();
  renderSearch("#", "any");
});

//// nav sub left
//stream
$('#stream').on('click', function() {
  if (stream !== undefined) {
    socket.emit('get_streaming_status', function(status) {
      //console.log(status);
      if (status === true) {
        // stop streaming
        audio_element.pause();
        audio_element.src = "";
        socket.emit('set_streaming_status', false);
        $('#stream').removeClass('active');
      }
      else {
        // start streaming
        audio_element.src = stream;
        audio_element.load();
        audio_element.play();
        socket.emit('set_streaming_status', true);
        $('#stream').addClass('active');
      }
    });
  }
});

// seek
$('#seek-bar-container').on('click', function(e) {
  // seek bar width is 200
  // subtract 30 for the left margin of x value
  var seek_ratio = ( (e.clientX - 30 )/ 200);
  var seek_sec = String(Math.round(seek_ratio * song.Time));
  socket.emit('mpd','seekcur',[seek_sec]);
});




////// dynamic
//// queue
//// playlists
//// browse
//// search
