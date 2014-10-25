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
              showInfo("streaming: off" , 2000);
              socket.emit('set_streaming_status', false);
              $('#stream').removeClass('active');
            }
            else { // start streaming
              audio_element.src = stream;
              audio_element.load();
              audio_element.play();
              showInfo("streaming: on" , 2000);
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
          socket.emit('mpd','seekcur',[seek_sec], function(err, msg) {
            if (err) {  }
            else { showInfo("seek to: " + secondsToTimeString(seek_ratio * song.Time) , 2000); }
          });
        } catch(err) { showInfo("error: " + err , 2000); }
      }); 
    });
    
    
    ////// dynamic
    //// queue
    // refresh queue click
    $('main').on('click', '.queue-refresh' ,function() {
      queueRequest();
    });
    // clear queue
    $('main').on('click','.queue-clear',function() {
      var button = $("<a href='#' id='clear-queue-confirm'>ok</a>");
      showInfo("clear queue? ", 10000);
      $('#info').append(button);
    });
    $('#info').on('click', '#clear-queue-confirm',function(e) {
      e.preventDefault();
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          showInfo("queue cleared", 1500);
          currentSongRequest();
          queueRequest();
        }
      });  
    });
    // shuffle queue
    $('main').on('click', '.queue-shuffle', function(){
      socket.emit('mpd', 'shuffle', [], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }         
        else { 
          showInfo("queue shuffled", 2000);
          queueRequest(); 
        }
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
      } catch (err) {
        showInfo("error: " + err, 2000);
      }
    });
    // click remove
    $('main').on('click', '.queue-remove', function() {
      var song = $(this).parents('.song');
      var songid = song.attr('data-id');
      socket.emit('mpd', 'deleteid', [songid], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          showInfo("song removed from queue", 1500);
          song.remove();
        } 
      });
    });
    
    
    //// playlists
    // save playlist
    $('main').on('keyup', '#save-playlist', function(e){
      if ( e.which === 13 ) {
        var playlistName = $('#save-playlist').val();
        socket.emit('mpd', 'save', [playlistName], function(err, msg){
          if (err === {}) { showInfo("error: " + err, 2000); }
          else {
            showInfo("playlist saved as: '" + playlistName + "'", 1500);
            playlistsRequest();
          }
        });
      }
    });
    // append
    $('main').on('click','.playlist-append', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'load', [playlist], function(err,msg){
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("playlist '" + playlist + "' added to queue", 1500); }
      });
    });
    // load
    $('main').on('click', '.playlist-load.button', function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        socket.emit('mpd', 'load', [playlist], function(err, msg){
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo("queue replaced with '" + playlist + "'", 1500); }
        });
      });
    });
    // delete
    $('main').on('click','.playlist-delete',function() {
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      var button = $("<a href='#' id='delete-playlist-confirm' data-playlist=" + playlist + ">ok</a>");
      showInfo("delete playlist " + playlist + "? ", 10000);
      $('#info').append(button);
    });
    $('#info').on('click', '#delete-playlist-confirm',function() {
      var playlist = $(this).attr('data-playlist');
      socket.emit('mpd', 'rm', [playlist], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          showInfo("playlist '" + playlist + "' deleted", 1500);
          playlistsRequest();
        }
      });  
    });
    
    //// browse
    // browse dir a
    $('main').on('click', 'a.browse-dir', function(e) {
      e.preventDefault();
      browseRequest($(this).attr('data-dir'));
    });
    // browse dir-info a
    $('main').on('click','a.browse-breadcrumb', function(e) {
      e.preventDefault();
      browseRequest("--" + $(this).attr('data-dir'));
    });

    // browse append
    $('main').on('click', '.browse-append', function() {
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'add', [dir], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("folder '" + dir + "' appended to queue", 1500); }
      });
    });
    // browse load
    $('main').on('click', '.browse-load', function() {
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'add', [dir], function(err,msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo("folder '" + dir + "' loaded into queue", 1500); }
        });
      });
    });
    
    
    //// search
    // enter on search field
    $('main').on('keyup', 'input.search-input', function(e) {
      if ( e.which === 13 ) {
        var searchString = $('#search').find('input.search-input').val();
        var searchType = $('#search').find('select.search-select').val();
        searchString.length <= 2 ?
          showInfo("please enter 3 chars as a minimum") :
          searchRequest(searchString, searchType);
      }
    });
    // change of search category select
    $('main').on('change', 'select.search-select', function() {
      var searchString = $('#search').find('input.search-input').val();
      var searchType = $('#search').find('select.search-select').val();
      searchString.length <= 2 ?
        showInfo("minimum: 3 characters", 2000) :
        searchRequest(searchString, searchType);
    });
    // click append
    $('main').on('click', '.search-append', function(){
      var dir = $(this).parents('.dir').attr('data-file');
      socket.emit('mpd', 'add', [dir], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("song '" + dir + "' added to queue", 1500); }
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
        browseRequest(directory);
      } catch (err) { showInfo("error: " + err, 2000); }
    });
    // click add all from album
    $('main').on('click', '.search-add-from-album', function() {
      try {
        var artist = $(this).parents('.dir').find('.attr.artist').text();
        var album = $(this).parents('.dir').find('.attr.album').text();
        socket.emit('mpd', 'searchadd', ['Artist',artist,'Album',album], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo(album + "' by " + artist + " added", 1500); }
        });
      }
      catch (err) { showInfo("error: " + err, 2000); }
    });
    // click add all from artist
    $('main').on('click', '.search-add-from-artist', function() {
      try {
        var artist = $(this).parents('.dir').find('.attr.artist').text();
        socket.emit('mpd', 'searchadd', ['Artist', artist], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo("added all songs by '" + artist + "' to queue", 1500); }
        });
      }
      catch (err) { showInfo("error: " + err, 2000); }
    });
    // click add all from search
    $('main').on('click', 'a.add-all-from-search', function(e) {
      e.preventDefault();
      try {
        var searchString = $('#search').find('input.search-input').val();
        var searchType = $('#search').find('select.search-select').val();
        console.log(searchType);
        console.log(searchString);
        socket.emit('mpd', 'searchadd', [searchType, searchString], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo("search results added to queue", 1500); }
        });
      }
      catch (err) { showInfo("error: " + err, 2000); }
    });

  }();
};

var interfaceRegistration = function() {

    new Status(function(err, status){
      if (err) { console.log(err); }
      else if (status.obj) {
        status = status.obj; 
        // unbind all elements to prevent multiple assignment
        $('#control-menu').off('click'); 
        $('#player-options').off('click');
        $('#queue').off('click');
    
        $('#control-menu').on('click', '#previous', function() {
          socket.emit('mpd', 'previous', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { showInfo("previous"); }
          });
        });
    
        $('#control-menu').on('click', '#next', function() {
          console.log('debug click');
          socket.emit('mpd', 'next', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { showInfo("next"); }
          });
        });
    
        $('#control-menu').on('click', '#play', function() {
          socket.emit('mpd', 'play', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { showInfo("play"); }
          });
        });
    
        $('#control-menu').on('click', '#pause', function() {
          socket.emit('mpd', 'pause', [(status.state === 'pause' ? 0 : 1)], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { showInfo("pause"); }
          });
        });
    
        $('#control-menu').on('click', '#stop', function() {
          socket.emit('mpd', 'stop', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { showInfo("stop"); }
          });
        });
    
    
        $('#queue').on('click', '#random', function() {
          socket.emit('mpd', 'random', [1 - status.random], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else {
              var random = 1 - status.random === 1 ? "on" : "off";
              showInfo("random: " + random, 1000); 
            }
          });
        });
    
        $('#queue').on('click', '#repeat', function() {
          socket.emit('mpd', 'repeat', [1 - status.repeat], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { 
              var repeat = 1 - status.repeat === 1 ? "on" : "off";
              showInfo("repeat: " + repeat, 1000);
            }
          });
        });
    
        $('#queue').on('click', '#consume', function() {
          socket.emit('mpd', 'consume', [1 - status.consume], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else {
              var consume = 1 - status.consume === 1 ? "on" : "off";
              showInfo("consume: " + consume, 1000);
            }
          });
        });
    
        // indicate the status (play, pause, stop)
        $('#control-menu').find('.button').removeClass('active');
        $('#control-menu').find('#' + status.state).addClass('active');
    
        // indicate the status (repeat, random, comsume)
        var random = $('#random');
        if (status.random === '1') {
          if (!random.hasClass('active')) {
            random.addClass('active');
          }
        } else { random.removeClass('active'); }
    
        var repeat = $('#repeat');
        if (status.repeat === '1') {
          if (!repeat.hasClass('active')) {
            repeat.addClass('active');
          }
        } else { repeat.removeClass('active'); }
        
        var consume = $('#consume');
        if (status.consume === '1') {
          if (!consume.hasClass('active')) {
            consume.addClass('active');
          }
        } else { consume.removeClass('active'); }
      }
    });
};




