var initHandlers = function() {

  return function() {
    
    ////// static
    //// nav top
    // logout
    $('#logout').on('click', function(){
      window.location = '/logout';
    });
    $('#settings').on('click', function(){
      showInfo('hi dude!', 3000);
    });
    
    //// nav main left
    // queue
    $('.button.queue').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.queue').addClass('active');
      $('main').html('<i class="fa fa-circle-o-notch fa-spin loading"></i>');
      queueRequest();
    });
    // playlists
    $('.button.playlists').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.playlists').addClass('active');
      $('main').html('<i class="fa fa-circle-o-notch fa-spin loading"></i>');
      playlistsRequest('none');
    });
    // browse
    $('.button.browse').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.browse').addClass('active');
      $('main').html('<i class="fa fa-circle-o-notch fa-spin loading"></i>');
      browseRequest("#");
    });
    // search
    $('.button.search').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.search').addClass('active');
      searchRequest();
    });
    // search_old
    $('.button.search-old').on('click', function(){
      $('nav').find('.button').removeClass('active');
      $('nav').find('.button.search-old').addClass('active');
      oldSearchRequest("#", "any");
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
      // subtract 30 for the left margin of x value
      new CurrentSong(function(err, Song) {
        var seekBarContainer = $('#seek-bar-container');
        //console.log(seekBarContainer.position().left);
        //console.log(seekBarContainer.width());
        var song = Song.data;
        var seek_ratio = ( (e.clientX - seekBarContainer.position().left ) / seekBarContainer.width());
        var seek_sec = String(Math.round(seek_ratio * song.Time));
        socket.emit('mpd','seekcur',[seek_sec], function(err, msg) {
          if (err) {  }
          //else { showInfo("seek " + Math.round(seek_ratio * 100) + "% into song" , 2000); }
        });
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
          showInfo("queue cleared", 2000);
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
          //showInfo("queue shuffled", 2000);
          queueRequest(); 
        }
      });
    });
    // click play with dblclick
    $('main').on('dblclick', '#queue > .scrollable > .item', function() {
      var songid = $(this).attr('data-id');
      var pathToSong = $(this).attr('data-path');
      socket.emit('mpd', 'playid', [songid], function() {
        //showInfo("play '" + pathToSong + "'", 2000);
      });
    });
    // click on artist
    $('main').on('click', '#queue > .scrollable > .item > .artist > a', function(e) {
      e.preventDefault();
      var artist = $(this).attr('data-artist');
      //console.log(artist);
      artistDetailsRequest(artist);
    });
    // click play from context
    $('main').on('click', '#queue > .contextmenu > .button-wrapper > .play', function() {
      var songid = $(this).closest('.contextmenu').attr('data-id');
      var songpath = $(this).closest('.contextmenu').attr('data-path');
      socket.emit('mpd', 'playid', [songid], function(err, msg) {
        if (err) { showInfo(err, 2000); }
        else { showInfo("play: '" + songpath + "'", 2000); }
      });
      $(".contextmenu").hide();
      $('.leftclick').removeClass('selected');
    });
    // click move next from context
    $('main').on('click', '#queue > .contextmenu > .button-wrapper > .movenext', function() {
      var songid = $(this).closest('.contextmenu').attr('data-id');
      socket.emit('mpd', 'moveid', [songid, -1], function(err, msg) {
        if (err) { showInfo(err, 2000); }
        else { showInfo("moved to next", 2000); }
      });
      $(".contextmenu").hide();
      $('.leftclick').removeClass('selected');
      queueRequest();
    });
    // click lookup from context
    $('main').on('click', '#queue > .contextmenu > .button-wrapper > .browse', function() {
      try {
        var directory = ($(this).closest('.contextmenu').attr('data-path').split('/'));
        directory.pop();
        directory = directory.join('/');
        browseRequest(directory);
      }
      catch (err) {
        showInfo("error: " + err, 2000);
        $(".contextmenu").hide();
        $('.leftclick').removeClass('selected');
      }
    });
    // click remove from context
    $('main').on('click', '#queue > .contextmenu > .button-wrapper > .remove', function() {
      var songid = $(this).closest('.contextmenu').attr('data-id');
      socket.emit('mpd', 'deleteid', [songid], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          showInfo("song removed", 2000);
          $('main').find('.queue > .item[data-id="' + songid + '"]').remove();
        } 
        $(".contextmenu").hide();
        $('.leftclick').removeClass('selected');
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
            showInfo("playlist saved as: '" + playlistName + "'", 2000);
            playlistsRequest(undefined);
          }
        });
      }
    });
    // sort playlists
    $('main').on('click', '#playlists > .nav-main > .button-wrapper > .button.sort-by-name', function() {
      playlistsRequest('name');
    });
    $('main').on('click', '#playlists > .nav-main > .button-wrapper > .button.sort-by-date', function() {
      playlistsRequest('lastmodified');
    });
    // append from context
    $('main').on('click', '#playlists > .contextmenu > .button-wrapper > .add', function() {
      var playlist = $(this).closest('.contextmenu').attr('data-name');
      socket.emit('mpd', 'load', [playlist], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {  showInfo("playlist '" + playlist + "' added to queue", 2000); }
        $(".contextmenu").hide();
        $('.leftclick').removeClass('selected');
      });
    });
    // load from context
    // append from context
    $('main').on('click', '#playlists > .contextmenu > .button-wrapper > .load', function() {
      var playlist = $(this).closest('.contextmenu').attr('data-name');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        socket.emit('mpd', 'load', [playlist], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo("playlist '" + playlist + "' added to queue", 2000); }
          $(".contextmenu").hide();
          $('.leftclick').removeClass('selected');
        });
      });
    });
    // delete from context
    $('main').on('click', '#playlists > .contextmenu > .button-wrapper > .delete', function() {
      var name = $(this).closest('.contextmenu').attr('data-name');      
      var button = $("<a href='#' id='delete-playlist-confirm' data-name=" + name + ">ok</a>");
      showInfo("delete playlist " + name + "? ", 10000);
      $('#info').append(button);
    });
    $('#info').on('click', '#delete-playlist-confirm',function() {
      var name = $(this).attr('data-name');
      socket.emit('mpd', 'rm', [name], function(err, msg) {
        if (err) { 
          showInfo("error: " + err, 2000);
          $(".contextmenu").hide();
          $('.leftclick').removeClass('selected');
        }
        else {
          showInfo("playlist '" + name + "' deleted", 1500);
          playlistsRequest();
        }
      });  
    });
    
    //// browse
    // rescan
    $('main').on('click', '#browse > .button-wrapper > .rescan', function() {
      socket.emit('mpd', 'rescan', [], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo('database rescan complete', 2000); }
      });
    });
    // sort browse results
    $('main').on('click', '#browse > .nav-main > .button-wrapper > .button.sort-by-name', function() {
      browseRequest('#', 'name');
    });
    $('main').on('click', '#browse > .nav-main > .button-wrapper > .button.sort-by-date', function() {
      browseRequest('#', 'lastmodified');
    });

    // browse breadcrumb
    $('main').on('click','#browse > .breadcrumb > .item', function() {
      browseRequest('#' + $(this).attr('data-position'));
    });
    // browse item
    $('main').on('click', '#browse > .scrollable > .item.folder', function() {
      //console.log($(this).attr('data-path'));
      browseRequest($(this).attr('data-path'));
    });

    // browse append via context
    $('main').on('click', '#browse > .contextmenu > .button-wrapper > .add', function() {
      var dir = $(this).closest('.contextmenu').attr('data-path');
      socket.emit('mpd', 'add', [dir], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo('songs added', 1500); }
      });
    });
    // browse load via context
    $('main').on('click', '.contextmenu.browse > .button-wrapper > .load', function() {
      var dir = $(this).closest('.contextmenu').attr('data-path');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'add', [dir], function(err,msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo('queue replaced', 1500); }
        });
      });
    });
    
    
    //// search
    // keyup on search field
    $('main').on('keyup', 'input.search-input', function(e) {
      var searchString = $('#search').find('input.search-input').val();
      if (e.which === 13) {
        // go to first result on enter
        if ($('main').find('.fuzzy-item').length > 0) {
          var artist = $('main').find('.fuzzy-item').first().attr('data-artist');
          artistDetailsRequest(artist);
        }
      }
      else if (searchString.length > 2) {
        searchRequestFuzzy(searchString);
      }
      else {
        searchRequestFuzzy('##');
      }
    });
    // click on searchType button
    $('main').on('click', '#search > .nav-main > .button-wrapper > .button.search-type', function() {
      $('#search > .nav-main > .button-wrapper > .button.search-type').removeClass('active');
      $(this).addClass('active');
      var searchString = $('#search > input.search-input').val();
      var searchType = $(this).attr('data-type');
      searchRequestFuzzy(searchString, searchType);
    });
    // artist details
    $('main').on('click', '#search > .scrollable > .fuzzy-container > .fuzzy-item', function() {
      var artist = $(this).attr('data-artist');
      artistDetailsRequest(artist);
    });
    // click on similar artist
    $('main').on('click', '.similar > .artist-container', function() {
      artistDetailsRequest(($(this).attr('data-artist')));
    });
    // add all from artist details
    $('main').on('click', '#artistdetails > .button-wrapper > .addall', function(e) {
      var artist = $(this).attr('data-artist');
      socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("songs added", 1500); }
      });
    });
    // play all from artist details
    $('main').on('click', '#artistdetails > .button-wrapper > .playall', function(e) {
      var artist = $(this).attr('data-artist');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { 
              showInfo("songs added", 1500); }
              socket.emit('mpd', 'play', []); 
          });
        }
      });
    });
    // add all from similar artists
    $('main').on('click', '#artistdetails > .scrollable > .similar > .button-wrapper > .addall', function(e) {
      var artists = $('main').find('.similar > .artist-container');
      if (artists) {
        $.each(artists, function(index, value) {
          var artist = $(this).attr('data-artist');
          socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
            showInfo("songs added", 1500);
          });
        });
      }
    });
    // add play all from similar artists
    $('main').on('click', '#artistdetails > .scrollable > .similar > .button-wrapper > .playall', function(e) {
      var artists = $('main').find('.similar > .artist-container');
      console.log(artists);
      if (artists) {
        socket.emit('mpd', 'clear', [], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else {
            var len = artists.length;
            $.each(artists, function(index, value) {
              var artist = $(this).attr('data-artist');
              socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
                console.log(msg);
                if (index === len - 1) {
                  socket.emit('mpd', 'play', []);
                  showInfo("songs added", 1500);
                }
              });
            });
          }
        });
      }
    });
    // show album details 
    $('main').on('click', '#artistdetails > .scrollable > .albums > .album-container', function() {
      var album = $(this).attr('data-name');
      $('main').find('#artistdetails > #cover').fadeIn();
      $('main').find('#artistdetails > #cover > .album-container[data-name="' + album + '"]').fadeIn();
    });
    $('main').on('click', '#artistdetails > #cover', function(e) {
      if (!$(e.target).parents('.button-wrapper').length > 0) {
        $('main').find('#artistdetails > #cover').fadeOut();
        $('main').find('#artistdetails > #cover > .album-container').hide();
      }
    });
    // album add
    $('main').on('click', '#artistdetails #cover .album-container .addall', function(){
      var album = $(this).closest('.button-wrapper').attr('data-album');
      var artist = $(this).closest('.button-wrapper').attr('data-artist');
      socket.emit('mpd', 'findadd', ['Artist',artist,'Album',album], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("songs added", 2000); }
      });
    });
    // album play
    $('main').on('click', '#artistdetails #cover .album-container .playall', function() {
      var album = $(this).closest('.button-wrapper').attr('data-album');
      var artist = $(this).closest('.button-wrapper').attr('data-artist');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else {
          socket.emit('mpd', 'findadd', ['Artist',artist,'Album',album], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
            else { 
              socket.emit('mpd', 'play', []);
              showInfo("songs added", 2000);
            }
          });
        }
      });
    });
    // song append
    $('main').on('click', '#artistdetails #cover .song .add', function(){
      var file = $(this).attr('data-file');
      socket.emit('mpd', 'add', [file], function(err, msg) {
        if (err) { showInfo("error: " + err, 2000); }
        else { showInfo("song added", 2000); }
      });
    });
    // click add all from album old
    $('main').on('click', '#search > .contextmenu > .button-wrapper > .add-from-album', function() {
      try {
        var artist = $(this).closest('.contextmenu').attr('data-artist');
        var album = $(this).closest('.contextmenu').attr('data-album');
        socket.emit('mpd', 'searchadd', ['Artist', artist, 'Album', album], function(err, msg) {
          if (err) { showInfo("error: " + err, 2000); }
          else { showInfo(album + "' by " + artist + " added", 1500); }
        });
      }
      catch (err) { showInfo("error: " + err, 2000); }
    });

    // contextmenu 
    //prevent Default for left click on whole document
    $(document).on('contextmenu', function(e) {
      e.preventDefault();
    });
    $('main').on('contextmenu', '.leftclick', function(e) {
      $(this).addClass('selected');
      
      // set id on contextmenu
      if ($(this).attr('data-id')) {
        var id = $(this).attr('data-id');
        $('.contextmenu').attr('data-id', id);
      }
      // set path on contextmenu
      if ($(this).find('.data-path')) {
        var path = $(this).attr('data-path');
        $('.contextmenu').attr('data-path', path);
      }
      // set artist on contextmenu
      if ($(this).find('.attr.artist')) {
        var artist = $(this).find('.attr.artist').text();
        $('.contextmenu').attr('data-artist', artist);
      }
      // set album on contextmenu
      if ($(this).find('.attr.album')) {
        var artist = $(this).find('.attr.album').text();
        $('.contextmenu').attr('data-album', artist);
      }
      // set name on contextmenu
      if ($(this).attr('data-name')) {
        var playlist = $(this).attr('data-name');
        $('.contextmenu').attr('data-name', playlist);
      }

      var y = e.clientY - $('main').position().top;
      var x = e.clientX - $('main').position().left;
      if ( ($(window).height() - e.clientY) < ($('main').height() / 2) ) {
        // if click is beneath half of main container, switch position
        y -= $('.contextmenu').height();
      }
      $('.contextmenu').finish().toggle(). // Show contextmenu
      css({ // In the right position (the mouse) minus header and left side
          top: y + 'px',
          left: x + 'px'
      });
    });
    // If the document is clicked somewhere
    $(document).on("mousedown", function(e) {
      // If the clicked element is not the menu
      if (!$(e.target).parents(".contextmenu").length > 0) {    
        $(".contextmenu").hide();
        $('.leftclick').removeClass('selected');
      }
      else {
        $(".contextmenu").fadeOut();
        $('.leftclick').removeClass('selected');
      }
    });

  }();
};

var interfaceRegistration = function() {
    new Status(function(err, status){
      if (err) { console.log(err); }
      else if (status.data) {
        status = status.data; 
        // unbind all elements to prevent multiple assignment
        $('#control-menu').off('click'); 
        $('#player-options').off('click');
        $('#queue').off('click');
    
        $('#control-menu').on('click', '#previous', function() {
          socket.emit('mpd', 'previous', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#control-menu').on('click', '#next', function() {
          socket.emit('mpd', 'next', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#control-menu').on('click', '#play', function() {
          socket.emit('mpd', 'play', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#control-menu').on('click', '#pause', function() {
          socket.emit('mpd', 'pause', [(status.state === 'pause' ? 0 : 1)], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#control-menu').on('click', '#stop', function() {
          socket.emit('mpd', 'stop', [], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
    
        $('#footer').on('click', '#random', function() {
          socket.emit('mpd', 'random', [1 - status.random], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#footer').on('click', '#repeat', function() {
          socket.emit('mpd', 'repeat', [1 - status.repeat], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
          });
        });
    
        $('#queue').on('click', '#consume', function() {
          socket.emit('mpd', 'consume', [1 - status.consume], function(err, msg) {
            if (err) { showInfo("error: " + err, 2000); }
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

