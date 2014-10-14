

var MpdAorta = function(callback) {
  //console.log('MpdAorta constructor called' );
  // Object with the current song and status
  var aorta = this;
  socket.emit('mpd', 'currentsong', [], function(err, data) {
    aorta.song = err ? err : data;
    socket.emit('mpd', 'status', [], function(err, data) {
      aorta.status = err ? err : data;
      callback(err, aorta);
    });
  });
};
var updateSongTime;
MpdAorta.prototype = {
  render : function() {
    //indicate status.state
    var status = this.status;
    var song = this.song;

    // hide all highlight markers fist
    $('.control-menu.left').find('.button').removeClass('active');

    // indicate the status (play, stop or pause) 
    $('.control-menu').find('#' + status.state).addClass('active');

    //indicate current status of random and repeat 
    if (status.random === '1') {
      $('.control-menu').find('#random').addClass('active');
    }
    if (status.repeat === '1') {
      $('.control-menu').find('#repeat').addClass('active');
    }

    //render current song
    var currentsong = $('#control-bar').find('.currentsong');
    if (status.state === 'stop') {
      currentsong.text("");
    }
    else {
      currentsong.html(song.Artist+ '<br>' + 
        song.Title + '<br>' + '<span class="muted">' + song.Album + '</span>')
    }
    //var currentTime = parseFloat(status.elapsed);
    //clearInterval(updateSongTime);
    //updateSongTime = setInterval(function(){
    //  currentTime += 1;
    //  $('#elapsed').text(secondsToTimeString(currentTime));
    //}, 1000);
  },
  registerHandler : function() {
    
    var status = this.status;
    var song = this.song;

    var register = function(elementID, args) {
      // register the interface
      // via JQuery bind method
      $('#' + elementID).off('click');
      $('#' + elementID).on('click', function(){
        // fire mpd command w/o callback
        socket.emit('mpd',elementID,args);
      });
    }

    // set the args for random, repeat and pause
    var random = 1 - status.random;
    var repeat =  1 - status.repeat;
    var pause = status.state === 'pause' ? 0 : 1;
    
    var handlerList = [ 
      ['previous', []],
      ['next', []], 
      ['play', []], 
      ['stop', []],
      ['random', [random]],
      ['repeat', [repeat]],
      ['pause', [pause]] 
    ];
    for (i in handlerList) {
      register(handlerList[i][0], handlerList[i][1]);
    }
    
    // register the seek function on the playlist-container
    $('#seek-bar-container').off('click');
    $('#seek-bar-container').on('click', function(e){
      var seek_ratio = (e.clientX / $(window).width()); 
      console.log(seek_ratio);
      var seek_sec = String(Math.round(seek_ratio * song.Time));
      console.log(song.Time);
      console.log(seek_sec);
      socket.emit('mpd','seekcur',[seek_sec]);
    });
    
  },
  renderProgressBar : function() {
    var progressBar = $('#seek-bar');
    
    var start = function startProgressbar (songTime,elapsed) {
      
      var initial_width = elapsed / songTime * 100; 
      var duration = songTime - elapsed;
      progressBar
        .stop()
        .css('width',initial_width + '%')
        .animate({'width': '100%'},duration * 1000, 'linear');
    };
    var stop = function stopProgressBar () {
      progressBar.stop();
    };

    var status = this.status;
    switch (status.state) {
      case 'play':
        var songTime = parseFloat(status.time.split(":")[1]);
        var elapsed = parseFloat(status.elapsed);
        start(songTime,elapsed);
        break;
      case 'pause':
        stop();
        break;
      case 'stop':
        stop();
        progressBar.css('width',0);
    }
  },
  indicate : function() {
    $('.song').removeClass('active');
    $('.song.' + this.song.Id).addClass('active');  
  }
};

var MpdPlaylist = function(callback) {
  var playlist = this;
  $.ajax({
    url:'/mpdplaylist'
  })
  .done(function(data) {
    playlist.html = data;
    callback({},playlist);  
  })
  .fail(function(err) {
    callback(err,{});
  });
};

MpdPlaylist.prototype = {
  render : function() {
    $('main').html(this.html);
  },
  indicate : function() {
    $('.song').removeClass('active');
    socket.emit('mpd', 'currentsong', [], function(err,song) {
      $('.song.' + song.Id).addClass('active'); 
    });
  },
  registerFunctionality : function() {
    // refresh playlist click
    $('#playlist-container').find('.refresh').off('click');
    $('#playlist-container').find('.refresh').on('click',function() {
      renderQueue();
    });

    // click play
    $('#playlist').on('click','.play', function() {
      //console.log($(this));
      var songid = $(this).parents('.song').attr('data-id');
      console.log(songid);
      socket.emit('mpd', 'playid', [songid]);
    });

    // click advanced
    $('#playlist').on('click','.advanced', function() {
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
    $('#playlist').on('click', '.search', function() {
      var artist = $(this).parents('.song').find('.attr.artist').text();
      renderSearch(artist, 'Artist');
    });

    // click lookup
    $('#playlist').on('click', '.lookup', function() {
      try {
        var directory = ($(this).parents('.song').attr('data-file').split('/'));
        directory.pop();
        directory = directory.join('/');
        console.log(directory);
        renderBrowse(directory);
      } catch (e) {}
    });

    // click remove
    $('#playlist').on('click', '.remove', function() {
      var song = $(this).parents('.song');
      var songid = song.attr('data-id');
      socket.emit('mpd', 'deleteid', [songid]);
      song.remove();
    });  

    var options = {
      html : true,
      placement : 'bottom'
    };

    // scroll to current song
    $('#playlist-container').find('.scroll').off('click');
    $('#playlist-container').find('.scroll').on('click', function(){
      socket.emit('mpd', 'currentsong', [], function(err, song){
        var scrolltop = $('.song.' + song.Id).offset().top +
          $('.scrollable').scrollTop() -
          $('.scrollable').offset().top;
        $('.scrollable').animate({
          scrollTop: scrolltop
        }, 500);
      });
    });

    // clear playlist
    $('#playlist-container').find('.clear').off('click');
    $('#playlist-container').find('.clear').on('click', function(){
      socket.emit('mpd', 'clear', [], function(){
        renderAorta(true);
      }); 
    });
  }
};