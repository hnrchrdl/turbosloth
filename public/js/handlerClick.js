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
      queueRequest();
    });
    // playlists
    $('.button.playlists').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.playlists').addClass('active');
      $('nav').find('.loading.playlists').show();
      playlistsRequest();
    });
    // browse
    $('.button.browse').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.browse').addClass('active');
      browseRequest("#");
    });
    // search
    $('.button.search').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.search').addClass('active');
      $('nav').find('.loading.search').show();
      searchRequest("#", "any");
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
    // dir a
    $('#browse').on('click', '.dir a', function(e) {
      e.preventDefault();
      renderBrowse($(this).attr('data-dir'));
    });
    // dir-info a
    $('#browse').on('click','.dir-info a', function(e) {
      e.preventDefault();
      renderBrowse("--" + $(this).attr('data-dir'));
    });

    // register Buttons
    $('#browse').on('click', '.append.button', function() {
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'add', [dir], function(err, msg){
        if (err) { console.log(err); }
        else {
          $('nav').find('.button').removeClass('active');
          $('nav').find('.button.queue').addClass('active');
          queueRequest();
        }
      });
    });

    $('#browse').on('click', '.load.button', function() {
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'add', [dir], function(err,msg){
          if (err) { console.log(err); }
          else {
            $('nav').find('.button').removeClass('active');
            $('nav').find('.button.queue').addClass('active');
            queueRequest();
          }
        });
      });
    });
    
    
    //// search
    // enter on search field
    $('#search').on('keyup', 'input.search-input', function(e) {
      if ( e.which === 13 ) {
        var searchString = $('#search').find('input.search-input').val();
        var searchType = $('#search').find('select.search-select').val();
        renderSearch(searchString, searchType);
      }
    });
    // change of search category select
    $('#search').on('change', 'select', function() {
      var searchString = $('#search').find('input.search-input').val();
      var searchType = $('#search').find('select.search-select').val();
      renderSearch(searchString, searchType);
    });
    // click append
    $('#search').on('click', '.append.button', function(){
      var dir = $(this).parents('.dir').attr('data-file');
      console.log(dir);
      socket.emit('mpd', 'add', [dir], function(err,msg){
        if (err) {
          console.log(err);
        }
      });
    });
    // click advanced
    $('#search').on('click','.advanced', function() {
      if ($(this).find('i').hasClass('fa-angle-down')) {
        $(this).find('i').removeClass('fa-angle-down');
        $(this).find('i').addClass('fa-angle-up');
        $(this).parents('.dir').height($(this).parents('.dir').height()*2);
      } else {
        $(this).find('i').removeClass('fa-angle-up');
        $(this).find('i').addClass('fa-angle-down');
        $(this).parents('.dir').height($(this).parents('.dir').height()/2);
      }
    });
    // click search artist
    $('#search').on('click', '.search', function() {
      var artist = $(this).parents('.dir').find('.attr.artist').text();
      renderSearch(artist, 'Artist');
    });
    // click lookup
    $('#search').on('click', '.lookup', function() {
      try {
        var directory = ($(this).parents('.dir').attr('data-file').split('/'));
        directory.pop();
        directory = directory.join('/');
        console.log(directory);
        renderBrowse(directory);
      } catch (e) {}
    });

  }();

};


var registerMpdInterface = function(status) {
  
  return function () {

    $('#left').on('click', '#previous', function() {
      socket.emit('mpd', 'previous', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#next', function() {
      socket.emit('mpd', 'next', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#play', function() {
      socket.emit('mpd', 'play', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#pause', function() {
      socket.emit('mpd', 'pause', [(status.state === 'pause' ? 0 : 1)], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#stop', function() {
      socket.emit('mpd', 'stop', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#random', function() {
      socket.emit('mpd', 'random', [1 - status.random], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#left').on('click', '#repeat', function() {
      socket.emit('mpd', 'repeat', [1 - status.repeat], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    // indicate the status (play, stop or pause)
    $('.control-menu').find('.button').removeClass('active');
    $('.control-menu').find('#' + status.state).addClass('active');

    status.random === '1' ? $('#random').addClass('active') : $('#random').removeClass('active');
    status.repeat === '1' ? $('#repeat').addClass('active') : $('#repeat').removeClass('active');
  }()
    
};




