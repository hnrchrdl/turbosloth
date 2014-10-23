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
    if (stream) {
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
    }
    
    //// seek
    $('#seek-bar-container').on('click', function(e) {
      // seek bar width is 200
      // subtract 30 for the left margin of x value
      new Aorta(function(a) {
        try {
          var song = a.song;
          var seek_ratio = ( (e.clientX - 30 )/ 200);
          var seek_sec = String(Math.round(seek_ratio * song.Time));
          socket.emit('mpd','seekcur',[seek_sec]);
        } catch(e) { console.log(e); }
      }); 
    });
    
    
    ////// dynamic
    //// queue
    // refresh queue click
    $('main').on('click', '.queue-refresh' ,function() {
      console.log('f');
      queueRequest();
    });
    // clear queue
    $('main').on('click', '.queue-clear', function(){
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { console.log(err); }
        else {
          var init = true;
          playerHasChanged(init);
        }
      });
    });
    // shuffle queue
    $('main').on('click', '.queue-shuffle', function(){
      socket.emit('mpd', 'shuffle', [], function(err, msg) {
        if (err) { console.log(err); }         
        else { queueRequest(); }
      });
    });
    // click play
    $('main').on('click', '.queue-play', function() {
      var songid = $(this).parents('.song').attr('data-id');
      socket.emit('mpd', 'playid', [songid]);
    });
    // click advanced
    $('main').on('click','.queue-advanced', function() {
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
    $('main').on('click', '.queue-search', function() {
      var artist = $(this).parents('.song').find('.attr.artist').text();
      searchRequest(artist, 'Artist');
    });
    // click lookup
    $('main').on('click', '.queue-lookup', function() {
      try {
        var directory = ($(this).parents('.song').attr('data-file').split('/'));
        directory.pop();
        directory = directory.join('/');
        browseRequest(directory);
      } catch (e) {
        console.log('error in directory lookup: ' + e);
      }
    });
    // click remove
    $('main').on('click', '.queue-remove', function() {
      var song = $(this).parents('.song');
      var songid = song.attr('data-id');
      socket.emit('mpd', 'deleteid', [songid]);
      song.remove();
    });
    
    
    //// playlists
    // save playlist
    $('main').on('keyup', '.playlists-save', function(e){
      if ( e.which === 13 ) {
        socket.emit('mpd', 'save', [$('#save-playlist').val()], function(err, msg){
          if (err) {
            console.log(err);
          }
          else {
            queueRequest();
          }
        });
      }
    });
    // append
    $('main').on('click','.playlists-append', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'load', [playlist], function(err,msg){
        if (err) {
          console.log(err);
        }
        else {
          queueRequest();  
        }
      });
    });
    // load
    $('main').on('click', '.playlists-load.button', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'load', [playlist], function(err,msg){
          if (err) { console.log(err); }
          else { queueRequest(); }
        });
      });
    });
    // delete
    $('main').on('click','.playlists-delete',function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'rm', [playlist], function(err,msg){
        if (err) { console.log(err); }
        else { queueRequest(); }
      });
    });
    
    //// browse
    // dir a
    $('main').on('click', 'a.browse-dir', function(e) {
      e.preventDefault();
      browseRequest($(this).attr('data-dir'));
    });
    // dir-info a
    $('main').on('click','a.browse-breadcrumb', function(e) {
      e.preventDefault();
      browseRequest("--" + $(this).attr('data-dir'));
    });

    // register Buttons
    $('main').on('click', '.browse-append', function() {
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

    $('main').on('click', '.browse-load', function() {
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
    $('main').on('keyup', 'input.search-input', function(e) {
      if ( e.which === 13 ) {
        var searchString = $('#search').find('input.search-input').val();
        var searchType = $('#search').find('select.search-select').val();
        searchRequest(searchString, searchType);
      }
    });
    // change of search category select
    $('main').on('change', 'select.search-select', function() {
      var searchString = $('#search').find('input.search-input').val();
      var searchType = $('#search').find('select.search-select').val();
      searchRequest(searchString, searchType);
    });
    // click append
    $('main').on('click', '.search-append', function(){
      var dir = $(this).parents('.dir').attr('data-file');
      console.log(dir);
      socket.emit('mpd', 'add', [dir], function(err,msg){
        if (err) {
          console.log(err);
        }
      });
    });
    // click advanced
    $('main').on('click','.search-advanced', function() {
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
    $('main').on('click', '.search-artist', function() {
      var artist = $(this).parents('.dir').find('.attr.artist').text();
      searchRequest(artist, 'Artist');
    });
    // click lookup
    $('main').on('click', '.search-lookup', function() {
      try {
        var directory = ($(this).parents('.dir').attr('data-file').split('/'));
        directory.pop();
        directory = directory.join('/');
        console.log(directory);
        browseRequest(directory);
      } catch (e) {}
    });
    // click add all from album
    $('#search').on('click', '.search-add-from-album', function() {
      
    });

  }();

};


var registerMpdInterface = function(status) {
  
  return function () {

    // unbind all elements to prevent multiple assignment
    $('#control-menu').off('click'); 
    $('#player-options').off('click');

    $('#control-menu').on('click', '#previous', function() {
      socket.emit('mpd', 'previous', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#control-menu').on('click', '#next', function() {
      socket.emit('mpd', 'next', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#control-menu').on('click', '#play', function() {
      socket.emit('mpd', 'play', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#control-menu').on('click', '#pause', function() {
      socket.emit('mpd', 'pause', [(status.state === 'pause' ? 0 : 1)], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#control-menu').on('click', '#stop', function() {
      socket.emit('mpd', 'stop', [], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });


    $('#player-options').on('click', '#random', function() {
      socket.emit('mpd', 'random', [1 - status.random], function(err, msg) {
        console.log(status);
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    $('#player-options').on('click', '#repeat', function() {
      socket.emit('mpd', 'repeat', [1 - status.repeat], function(err, msg) {
        if (err) { console.log(err); }
        else { console.log(msg); }
      });
    });

    // indicate the status (play, stop or pause)
    $('#control-menu').find('.button').removeClass('active');
    $('#control-menu').find('#' + status.state).addClass('active');

    status.random === '1' ? $('#random').addClass('active') : $('#random').removeClass('active');
    status.repeat === '1' ? $('#repeat').addClass('active') : $('#repeat').removeClass('active');

  }()
    
};




