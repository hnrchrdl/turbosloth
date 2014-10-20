var initHandlers = function() {
  return function() {
    
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
          if (status === true) { // stop streaming
            audio_element.pause();
            audio_element.src = "";
            socket.emit('set_streaming_status', false);
            $('#stream').removeClass('active');
          }
          else { // start streaming
            audio_element.src = stream;
            audio_element.load();
            audio_element.play();
            socket.emit('set_streaming_status', true);
            $('#stream').addClass('active');
          }
        });
      }
    });
    
    

    //// seek
    $('#seek-bar-container').on('click', function(e) {
      // seek bar width is 200
      // subtract 30 for the left margin of x value
      var seek_ratio = ( (e.clientX - 30 )/ 200);
      var seek_sec = String(Math.round(seek_ratio * song.Time));
      socket.emit('mpd','seekcur',[seek_sec]);
    });
    
    
    
    ////// dynamic
    //// queue
    // refresh queue click
    $('#queue-container').on('click', '.refresh' ,function() {
      renderQueue();
    });
    // click play
    $('#queue').on('click','.play', function() {
      var songid = $(this).parents('.song').attr('data-id');
      socket.emit('mpd', 'playid', [songid]);
    });
    // click advanced
    $('#queue').on('click','.advanced', function() {
      if ($(this).find('i').hasClass('fa-angle-down')) {
        $(this).find('i').removeClass('fa-angle-down');
        $(this).find('i').addClass('fa-angle-up');
        $(this).parents('.song').height($(this).parents('.song').height()*2);
      } else {
        $(this).find('i').removeClass('fa-angle-up');
        $(this).find('i').addClass('fa-angle-down');
        $(this).parents('.song').height($(this).parents('.song').height()/2);
      }
    });
    // click search artist
    $('#queue').on('click', '.search', function() {
      var artist = $(this).parents('.song').find('.attr.artist').text();
      renderSearch(artist, 'Artist');
    });
    // click lookup
    $('#queue').on('click', '.lookup', function() {
      try {
        var directory = ($(this).parents('.song').attr('data-file').split('/'));
        directory.pop();
        directory = directory.join('/');
        renderBrowse(directory);
      } catch (e) {
        console.log('error in directory lookup: ' + e);
      }
    });
    // click remove
    $('#queue').on('click', '.remove', function() {
      var song = $(this).parents('.song');
      var songid = song.attr('data-id');
      socket.emit('mpd', 'deleteid', [songid]);
      song.remove();
    });
    // clear queue
    $('#queue-container').on('click', '.clear.button', function(){
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { console.log(err); }
        else {
          var init = true;
          playerHasChanged(init);
        }
      }); 
    });
    // shuffle queue
    $('#queue-container').on('click', '.shuffle.button', function(){
      socket.emit('mpd', 'shuffle', [], function(err, msg) {
        if (err) { console.log(err); }         
        else { renderQueue(); }
      });
    });
    
    
    //// playlists
    // save playlist
    $('#playlists').on('keyup', 'input.save-playlist', function(){
      if ( e.which === 13 ) {
        socket.emit('mpd', 'save', [$('#save-playlist').val()], function(err, msg){
          if (err) {
            console.log(err);
          }
          else {
            renderQueue();
          }
        });
      }
    });
    // append
    $('#playlists').on('click','.append.button', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'load', [playlist], function(err,msg){
        if (err) {
          console.log(err);
        }
        else {
          renderQueue();  
        }
      });
    });
    // load
    $('#playlists').on('click', '.load.button', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'load', [playlist], function(err,msg){
          if (err) { console.log(err); }
          else { renderQueue(); }
        });
      });
    });
    // delete
    $('#playlists').on('click','.delete.button',function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'rm', [playlist], function(err,msg){
        if (err) { console.log(err); }
        else { renderQueue(); }
      });
    });
    
    //// browse
    
    //// search

    
  }();
};


function registerMpdInterface(status) {
  
  var container = $('#left');
  var handlerList = [ 
    {'element':'#previous', 'command':'previous', 'args':[]},
    {'element':'#next', 'command':'next', []},
    {'element':'#play', 'command':'play', []}, 
    {'element':'#pause', 'command':'pause', 'args':[(status.state === 'pause' ? 0 : 1)]}, 
    {'element':'#stop', 'command':'stop', 'args':[]],
    {'element':'#random', 'command':'random', 'args':[1 - status.random]},
    {'element':'#repeat', 'command':'repeat', 'args':[1 - status.repeat]}
  ];

  for (i in handlerList) {
    var handle = handlerList[i];
    container.on('click', handle.element, function() {
      socket.emit('mpd', handle.command, handle.args, function(err, msg) {
        if (err) { console.log(err); } 
        else if (callback) { callback(err, msg); }
      });
  }

  // indicate the status (play, stop or pause)
  $('.control-menu').find('.button').removeClass('active');
  $('.control-menu').find('#' + status.state).addClass('active');

  status.random === '1' ? $('#random').addClass('active') : $('#random').removeClass('active');
  status.repeat === '1' ? $('#repeat').addClass('active') : $('#repeat').removeClass('active');
    
}




