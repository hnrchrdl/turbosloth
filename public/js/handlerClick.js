var initHandlers = function() {

  return function() {
    
    ////// static
    //// nav top
    // logout
    $('#logout').on('click', function(){
      window.location = '/logout';
    });
    $('#settings').on('click', function(){
      showError('settings coming soon...', 3000);
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
          if (err) { showInfo("queue cleared", 2000); }
          //else { showInfo("seek " + Math.round(seek_ratio * 100) + "% into song" , 2000); }
        });
      }); 
    });
    

    
    ////// dynamic handlers



    //// queue


    // click play with dblclick
    $('main').on('dblclick', '#queue .item', function() {
      var songid = $(this).attr('data-id');
      var pathToSong = $(this).attr('data-path');

      socket.emit('mpd', 'playid', [songid], function() {
        //showInfo("play '" + pathToSong + "'", 2000);
      });
    });

    //// queue
    // clear
    $('main').on('click','.clear', function() {
      $('#option-clearqueue').slideDown('fast');
    });
    // ok
    $('body').on('click', '#option-clearqueue .ok', function() { 
      socket.emit('mpd', 'clear', [], function(err, msg) {
        $('#option-clearqueue').slideUp('fast');
        if (err) { showInfo("error: " + err, 2500); }
        else {
          showInfo("queue cleared", 2000);
          currentSongRequest();
          queueRequest();
        }
      });  
    });
    // cancel
    $('body').on('click', '#option-clearqueue .cancel', function() { 
      $('#option-clearqueue').slideUp('fast');
    });


    //// queue
    // shuffle
    $('main').on('click', '#queue .shuffle', function() {
      
      socket.emit('mpd', 'shuffle', [], function(err, msg) {
        if (err) { 
          showInfo("error: " + err, 2000); 
        }         
        else { 
          //showInfo("queue shuffled", 2000);
          queueRequest(); 
        }
      });
    });

    //// queue
    // save as new playlist
    $('main').on('click', '#queue .save-playlist', function() {
      $('#option-save-playlist').slideDown('fast');
      $('#option-save-playlist input#save-playlist').focus();
    });
    //ok
    $('body').on('click', '#option-save-playlist .ok', function() {
      var playlistName = $('#save-playlist').val();
      if (playlistName !== "" && playlistName !== " ") {
        socket.emit('mpd', 'save', [playlistName], function(err, msg) {
          $('#option-save-playlist').slideUp('fast');
          if (err) { 
            showInfo("error : " + err, 2000); }
          else {
            showInfo("playlist saved as: '" + playlistName + "'", 2500);
          }
        });
      }
      else {
        showInfo("please enter one or more characters", 2500);
      }
    });
    //cancel
    $('body').on('click', '#option-save-playlist .cancel', function() { 
      $('#option-save-playlist').slideUp('fast');
    });


    //// queue
    // sloth mode
    $('main').on('click', '#queue .sloth-mode', function() {
      showError('sloth mode coming soon...', 2500);
    });


    ////  queue | links
    // click on artist link
    $('main').on('click', '#queue .artist a', function(e) {
      e.preventDefault();
      var artist = $(this).attr('data-artist');
      artistDetailsRequest(artist);
    });
    //click on album link
    $('main').on('click', '#queue .album a', function(e) {
      e.preventDefault();
      var artist = $(this).attr('data-artist');
      var album = $(this).attr('data-album');
      artistDetailsRequest(artist);

      setTimeout(function() { // a little timeout to let the page render first
        $('main').find('#artistdetails > .cover').fadeIn();
        $('main').find('#artistdetails > .cover > .album-container[data-name="' + album + '"]').fadeIn();
      },1000);
    });


    //// queue
    // selection handling
    var posMousedown, posMousedown, selected; 
    var mousedownTriggered = false;

    $('main').on('mousedown', '#queue .item .selector', function() {
      mousedownTriggered = true;
      posMousedown = $(this).closest('.item').attr('data-pos');
      selected = ($(this).hasClass('active') === true);
    });

    $('main').on('mouseup', '#queue .item .selector', function() {
      if (mousedownTriggered) {
        posMouseup = $(this).closest('.item').attr('data-pos');
        
        try {
          var start = parseInt(posMousedown);
          var end = parseInt(posMouseup);
        }
        catch(err) {
          showInfo('Error trying to get song positions', 2500);
          mousedownTriggered = false;
          return; 
        }

        if (start > end) { // if start is greater than end, swap them
          var start_tmp = start;
          start = end;
          end = start_tmp;
        }

        for (i = start; i <= end; i++) {
          if (selected) { $('main').find('#queue .item[data-pos="' + i + '"] .selector').removeClass('active'); }
          else { $('main').find('#queue .item[data-pos="' + i + '"] .selector').addClass('active'); }
          if ($('body').find('#queue .item .selector').is('.active')) { $('#options-queue').slideDown('fast'); }
          else { $('#options-queue').slideUp('fast'); } 
        }
      }
      else { mousedownTriggered = false; }
    });
    

    //// queue
    // check all / uncheck all
    $('body').on('click', '#queue .selecthelper', function() {
      if ($(this).hasClass('selectall')) {
        $('main').find('#queue .item .selector').addClass('active');
        $('#options-queue').slideDown('fast');
      }
      else {
        $('main').find('#queue .item .selector').removeClass('active');
        $('#options-queue').slideUp('fast');
      }
    });


    //// queue | options

    //// queue | options
    //play next
    $('body').on('click', '#options-queue .playnext', function() {
      var songs = $('main').find('#queue .item .selector.active');
      var songcount = songs.length;
      var songPositions = [];

      $.each(songs, function(index, value) {
        songPositions.push($(this).closest('.item').attr('data-pos'));
      });

      songPositions.sort().reverse(); // sort reverse to keep the current ordering

      $.each(songPositions, function(index, value) {
        playNext(value, function() {
          if (index === songcount - 1) {
            $('#options-queue').slideUp('fast');
              showInfo(songcount + ' song(s) moved', 2500);
              queueRequest();
          }
        });
      });
    });

    //// queue | options
    // add to playlist
    $('body').on('click', '#options-queue .addtoplaylist', function() {
      socket.emit('mpd', 'listplaylists', [], function(err, data) {
        $('#options-queue').slideUp('fast');
        if (err) {
          showError('error fetching playlists: ' + err, 3000);
        }
        else if (data && data.length > 0) {
          $('#playlist-selector .playlists').html(""); // clear contents
          $.each(data, function(index, value) {
            var playlist_name = value.playlist;
            var button = $('<div>', {
              class: 'button text save', 
              text: playlist_name
            }).attr('data-name', playlist_name);
            var button_wrapper = $('<div>', {class: 'button-wrapper'})
                .append(button)
                .appendTo($('#playlist-selector .playlists'));

          });
          // show the playlist selector with dynamic content
          $('#playlist-selector').slideDown('fast');
        }
        else {
          showInfo('no playlists found', 2500);
        }
      })
    });
    //playlist clicked
    $('body').on('click', '#playlist-selector .button.save', function() {
      var playlist_name = $(this).attr('data-name');
      var songs = $('main').find('#queue .item .selector.active');
      var songcount = songs.length;
      var errors = 0;
      $.each(songs, function(index, value) {
        var songPath = $(this).closest('.item').attr('data-path');
        addSongToPlaylist(songPath, playlist_name, function(added) {
          if (!added) {errors += 1; }
          if (index === songcount - 1) {
            $('#playlist-selector').slideUp('fast');
            if (errors > 0) { showError(errors + ' song(s) could not be added!', 3000); }
            else { 
              showInfo(songcount + ' song(s) added to playlist "' + playlist_name + '"', 2500);
              setTimeout(function() { $('#options-queue').slideDown('fast'); }, 2500);
            }
          }
        });
      });
    });
    //cancel
    $('body').on('click', '#playlist-selector .cancel', function() {
      $('#playlist-selector').slideUp('fast');
      $('#options-queue').slideDown('fast');
    });

    
    //// queue | options
    // crop
    $('body').on('click', '#options-queue .crop', function() {
      var songsToCrop = $('main').find('#queue .item .selector.active');
      songsToCropIds = [];

      $.each(songsToCrop, function(index, value) {
        songsToCropIds.push($(this).closest('.item').attr('data-id'));
      });

      var songsAll = $('main').find('#queue .item .selector');
      var songcount = songsAll.length - songsToCrop.length;
      var errors = 0;
      
      $.each(songsAll, function(index, value) {
        var songId = $(this).closest('.item').attr('data-id');
        if ($.inArray(songId, songsToCropIds) === -1) {

          removeSongFromQueue(songId, function(deleted) {
            if (!deleted) { errors += 1 };
            if (index === songcount - 1) {
              $('#options-queue').hide();
              if (errors > 0) { showError(errors + ' songs could not be deleted!', 3000); }
              else { 
                showInfo(songcount + ' song(s) removed', 2500);
                queueRequest(); 
              }
            }
          });
        }
      });
    });

    //// queue | options
    //remove
    $('body').on('click', '#options-queue .remove', function() {

      var songs = $('main').find('#queue .item .selector.active');
      var songcount = songs.length;
      var errors = 0;

      $.each(songs, function(index, value) {
        var songId = $(this).closest('.item').attr('data-id');

        removeSongFromQueue(songId, function(deleted) {
          if (!deleted) { errors += 1 };
          if (index === songcount - 1) {
            $('#options-queue').hide();
            if (errors > 0) { showError(errors + ' songs could not be deleted!', 3000); }
            else { 
              showInfo(songcount + ' song(s) deleted', 2500);
              queueRequest(); 
            }
          }
        });
      });
    });

    




    //// playlists


    // sort playlists
    $('main').on('click', '#playlists > .nav-main > .button-wrapper > .button.sort-by-name', function() {
      playlistsRequest('name');
    });
    $('main').on('click', '#playlists > .nav-main > .button-wrapper > .button.sort-by-date', function() {
      playlistsRequest('lastmodified');
    });

    //// playlists
    // click on playlist
    $('main').on('click', '#playlists .playlist', function() {
      var playlist = $(this).attr('data-name');
      console.log(playlist);
      playlistDetailsRequest(playlist);
    });
    // hide the playlist details cover
     $('main').on('click', '#playlists .cover', function(e) {
      if (!$(e.target).parents('.button-wrapper').length > 0) {
        $('main').find('#playlists .cover').fadeOut();
      }
    });


    //// playlist | details
    
    // rename
    $('main').on('click', '#playlists .cover .options .rename', function() {
      $('#option-playlist-rename').slideDown('fast');
    });
    //ok
    $('#option-playlist-rename').on('click', ('.ok'), function() {
      var playlist = $('#playlists .cover .playlist-container').attr('data-name');
      var newname = $('body').find('#option-playlist-rename input.playlist-rename').val();
      console.log(playlist, newname);
      socket.emit('mpd', 'rename', [playlist, newname], function(err, msg) {
      $('#option-playlist-rename').slideUp('fast');
        if (err) {
          showError('error deleting playlist', 3000);
        }
        else {
          showInfo('playlist "' + playlist + '" renamed to "' + newname + '"', 2500);
          playlistsRequest();
          setTimeout(function() { playlistDetailsRequest(newname); }, 200);
        }
      });
    });
    //cancel
    $('#option-playlist-rename').on('click', ('.cancel'), function() {
      $('#option-playlist-rename').slideUp('fast');
    });
    
    //// playlist | details
    // delete
    $('main').on('click', '#playlists .cover .options .delete', function() {
      $('#option-playlist-delete').slideDown('fast');
    });
    //ok
    $('#option-playlist-delete').on('click', ('.ok'), function() {
      var playlist = $('#playlists .cover .playlist-container').attr('data-name');
      socket.emit('mpd', 'rm', [playlist], function(err, msg) {
        $('#option-playlist-delete').slideUp('fast');
        if (err) {
          showError('error deleting playlist', 3000);
        }
        else {
          showInfo('playlist "' + playlist + '" deleted', 2500);
          playlistsRequest();
        }
      });
    });
    //cancel
    $('#option-playlist-delete').on('click', ('.cancel'), function() {
      $('#option-playlist-delete').slideUp('fast');
    });

    //// playlist | details
    // playlist add
    $('main').on('click', '#playlists .cover .button.addall', function(){
      var playlist = $(this).closest('.button-wrapper').attr('data-name');
      socket.emit('mpd', 'load', [playlist], function(err, msg) {
        if (err) { showInfo("error: " + err, 2500); }
        else { showInfo("playlist added to queue", 2500); }
      });
    });

    //// playlist | details
    // playlist play
    $('main').on('click', '#playlists .cover .button.playall', function() {
      var playlist = $(this).closest('.button-wrapper').attr('data-name');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else {
          socket.emit('mpd', 'load', [playlist], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
            else { 
              socket.emit('mpd', 'play', []);
              showInfo("queue replaced with playlist", 2500);
            }
          });
        }
      });
    });

    //// playlist | details
    // song append
    $('main').on('click', '#playlists .cover .song .add', function(){
      var file = $(this).attr('data-file');
      socket.emit('mpd', 'add', [file], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else { showInfo("song added to queue", 2500); }
      });
    });

    //// playlist | details
    // song remove
    $('main').on('click', '#playlists .cover .song .remove', function(){
      var pos = $(this).attr('data-pos');
      var playlist = $('#playlists .cover .playlist-container').attr('data-name');
      socket.emit('mpd', 'playlistdelete', [playlist, pos], function(err, msg) {
        if (err) {
          showError('error deleting song', 3000);
        }
        else {
          showInfo('song removed from playlist', 2500);
          playlistsRequest();
          setTimeout(function() { playlistDetailsRequest(playlist); }, 200);
        }
      });
    });



    



    //// browse


    // rescan
    $('main').on('click', '#browse > .button-wrapper > .rescan', function() {
      socket.emit('mpd', 'rescan', [], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else { showInfo('database rescan complete', 2500); }
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
        if (err) { showError("error: " + err, 3000); }
        else { showInfo('songs added', 2500); }
      });
    });
    // browse load via context
    $('main').on('click', '.contextmenu.browse > .button-wrapper > .load', function() {
      var dir = $(this).closest('.contextmenu').attr('data-path');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'add', [dir], function(err,msg) {
          if (err) { showError("error: " + err, 3000); }
          else { showInfo('queue replaced', 2500); }
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

    //// search
    // click on searchType button
    $('main').on('click', '#search .button.search-type', function() {
      $('#search > .nav-main > .button-wrapper > .button.search-type').removeClass('active');
      $(this).addClass('active');
      var searchString = $('#search > input.search-input').val();
      var searchType = $(this).attr('data-type');
      searchRequestFuzzy(searchString, searchType);
    });

    //// search
    // artist details
    $('main').on('click', '#search .fuzzy-item', function() {
      var artist = $(this).attr('data-artist');
      artistDetailsRequest(artist);
    });



    //// artistdetails

    // click on similar artist
    $('main').on('click', '#artistdetails .similar > .artist-container', function() {
      artistDetailsRequest(($(this).attr('data-artist')));
    });
    // add all from artist details
    $('main').on('click', '#artistdetails > .button-wrapper > .addall', function(e) {
      var artist = $(this).attr('data-artist');
      socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else { showInfo("songs added", 2500); }
      });
    });

    //// artistdetails
    // play all from artist details
    $('main').on('click', '#artistdetails > .button-wrapper > .playall', function(e) {
      var artist = $(this).attr('data-artist');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else {
          socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
            else { 
              showInfo("songs added", 2500); }
              socket.emit('mpd', 'play', []); 
          });
        }
      });
    });

    //// artistdetails
    // add all from similar artists
    $('main').on('click', '#artistdetails .similar .addall', function(e) {
      var artists = $('main').find('.similar > .artist-container');
      if (artists) {
        $.each(artists, function(index, value) {
          var artist = $(this).attr('data-artist');
          socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
            showInfo("songs added", 2500);
          });
        });
      }
    });

    //// artistdetails
    // add play all from similar artists
    $('main').on('click', '#artistdetails .similar .playall', function(e) {
      var artists = $('main').find('.similar > .artist-container');
      console.log(artists);
      if (artists) {
        socket.emit('mpd', 'clear', [], function(err, msg) {
          if (err) { showError("error: " + err, 3000); }
          else {
            var len = artists.length;
            $.each(artists, function(index, value) {
              var artist = $(this).attr('data-artist');
              socket.emit('mpd', 'findadd', ['Artist', artist], function(err, msg) {
                console.log(msg);
                if (index === len - 1) {
                  socket.emit('mpd', 'play', []);
                  showInfo("songs added", 2500);
                }
              });
            });
          }
        });
      }
    });

    //// artistdetails
    // show album details 
    $('main').on('click', '#artistdetails > .scrollable > .albums > .album-container', function() {
      var album = $(this).attr('data-name');
      $('main').find('#artistdetails > .cover').fadeIn();
      $('main').find('#artistdetails > .cover > .album-container[data-name="' + album + '"]').show();
    });
    //hide the album details cover
    $('main').on('click', '#artistdetails > .cover', function(e) {
      if (!$(e.target).parents('.button-wrapper').length > 0) {
        $('main').find('#artistdetails > .cover').fadeOut();
        $('main').find('#artistdetails > .cover > .album-container').hide();
      }
    });

    //// artistdetails
    // album add
    $('main').on('click', '#artistdetails .cover .album-container .addall', function(){
      var album = $(this).closest('.button-wrapper').attr('data-album');
      var artist = $(this).closest('.button-wrapper').attr('data-artist');
      socket.emit('mpd', 'findadd', ['Artist',artist,'Album',album], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else { showInfo("songs added", 2500); }
      });
    });

    //// artistdetails
    // album play
    $('main').on('click', '#artistdetails .cover .album-container .playall', function() {
      var album = $(this).closest('.button-wrapper').attr('data-album');
      var artist = $(this).closest('.button-wrapper').attr('data-artist');
      socket.emit('mpd', 'clear', [], function(err, msg) {
        if (err) { showError("error: " + err, 2000); }
        else {
          socket.emit('mpd', 'findadd', ['Artist',artist,'Album',album], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
            else { 
              socket.emit('mpd', 'play', []);
              showInfo("songs added", 2500);
            }
          });
        }
      });
    });

    //// artistdetails
    // song append
    $('main').on('click', '#artistdetails .cover .song .add', function(){
      var file = $(this).attr('data-file');
      socket.emit('mpd', 'add', [file], function(err, msg) {
        if (err) { showError("error: " + err, 3000); }
        else { showInfo("song added", 2500); }
      });
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
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#control-menu').on('click', '#next', function() {
          socket.emit('mpd', 'next', [], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#control-menu').on('click', '#play', function() {
          socket.emit('mpd', 'play', [], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#control-menu').on('click', '#pause', function() {
          socket.emit('mpd', 'pause', [(status.state === 'pause' ? 0 : 1)], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#control-menu').on('click', '#stop', function() {
          socket.emit('mpd', 'stop', [], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
    
        $('#footer').on('click', '#random', function() {
          socket.emit('mpd', 'random', [1 - status.random], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#footer').on('click', '#repeat', function() {
          socket.emit('mpd', 'repeat', [1 - status.repeat], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
          });
        });
    
        $('#queue').on('click', '#consume', function() {
          socket.emit('mpd', 'consume', [1 - status.consume], function(err, msg) {
            if (err) { showError("error: " + err, 3000); }
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

