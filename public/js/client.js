var socket = io();
var audio_element = document.getElementsByTagName("audio")[0];

jQuery.fx.interval = 100;

$(document).ready(function() {

  // fix window resize
  $(window).on('resize', function(){
    fixScrollHeight();
  });

  // init script
  var init = true;
  playerHasChanged(init);

  // init the audio element on start
  initAudioElement(audio_element);

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

});

//// sockets
socket.on('connect', function (){
  console.log('established socket connection');
});
socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});
socket.on('change', function(system) {
  console.log('subsystem changed: ' + system);
  var init = false;
  playerHasChanged(init);
});

function registerMpdInterface(status) {
  // set the args for random, repeat and pause

  var handlerList = [ 
    [$('#left'), ('#previous'), 'previous', []],
    [$('#left'), ('#next'), 'next', []], 
    [$('#left'), ('#play'), 'play', []], 
    [$('#left'), ('#pause'), 'pause', [(status.state === 'pause' ? 0 : 1)]], 
    [$('#left'), ('#stop'), 'stop', []],
    [$('#left'), ('#random'), 'random', [1 - status.random]],
    [$('#left'), ('#repeat'), 'repeat', [1 - status.repeat]]
  ];

  for (i in handlerList) {
    registerButton(handlerList[i][0], handlerList[i][1], handlerList[i][2], handlerList[i][3]);
  }

  // indicate the status (play, stop or pause)
  $('.control-menu').find('.button').removeClass('active');
  $('.control-menu').find('#' + status.state).addClass('active');

  status.random === '1' ? $('#random').addClass('active') : $('#random').removeClass('active');
  status.repeat === '1' ? $('#repeat').addClass('active') : $('#repeat').removeClass('active');
    
}

function registerQueueFunctions() {
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
}


function playerHasChanged(init) {
  var a = new Aorta(function(data) {
    if (data) {
      registerMpdInterface(data.status);
      renderCurrentSong(data.status, data.song);
      renderProgressBar(data.status);
      init ? queueHasChanged() : highlightSongInQueue(data.song);
    }
  });
}

function queueHasChanged() {
  var q = new Queue(function(err, queue) {
    if (queue) {
      queue.render();
      registerQueueFunctions();
    }
    else { console.log(err); }
  });
}

function renderCurrentSong(status, song) {
  var currentsong = $('#left').find('.currentsong');
  if (status.state === 'stop') {
    currentsong.text("");
  }
  else {
    currentsong.html(song.Artist+ '<br>' + 
        song.Title + '<br>' + '<span class="muted">' + 
        song.Album + '</span>');
  }
  // fetch album cover
  //fetch_album_cover(song.Artist, song.Album, function(url) {
  //  console.log(url);
  //});
  // highlight current song in queue
  highlightSongInQueue(song);
}

function highlightSongInQueue(song) {
  $('#queue').find('.song').removeClass('active');
  $('#queue').find('.song').find('.attr.songpos').removeClass('active');
  $('#queue').find('.song.' + song.Id).addClass('active');
  $('#queue').find('.song.' + song.Id).find('.attr.songpos').addClass('active');
}

function renderProgressBar(status) {
  var progressBar = $('#seek-bar');
  // start
  var start = function startProgressbar (songTime,elapsed) {
    var initial_width = elapsed / songTime * 100; 
    var duration = songTime - elapsed;
    progressBar
      .stop()
      .css('width',initial_width + '%')
      .animate({'width': '100%'},duration * 1000, 'linear');
  };
  // stop
  var stop = function stopProgressBar () {
    progressBar.stop();
  };

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
}

function renderPlaylists() {
  // manage playlist click
  $.ajax({
    url: '/manageplaylist'
  }).done(function(html){
    // inject html
    $('main').html(html);
    fixScrollHeight();
    $('nav').find('.loading.playlists').hide();
    
    // register buttons
    $('#manageplaylist').on('keyup', 'input.save-playlist', function(){
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

    $('#manageplaylist').find('.append.button').off('click');
    $('#manageplaylist').find('.append.button').on('click', function(){
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

    $('#manageplaylist').find('.load.button').off('click');
    $('#manageplaylist').find('.load.button').on('click', function(){
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'load', [playlist], function(err,msg){
          if (err) {
            console.log(err);
          }
          else {
            $('nav').find('.button').removeClass('active');
            $('nav').find('.button.queue').addClass('active');
            renderQueue(); 
          }
        });
      });
    });

    $('#manageplaylist').find('.delete.button').off('click');
    $('#manageplaylist').find('.delete.button').on('click', function(){
      var playlist = $(this).parents('.playlist').attr('data-playlist');
      socket.emit('mpd', 'rm', [playlist], function(err,msg){
        if (err) {
          console.log(err);
        }
        else {
          renderQueue();  
        }
      });
    });
  });
}


function renderBrowse(folder) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.browse').addClass('active');
  $('nav').find('.loading.browse').show();
  $.ajax({
    url: 'browse/' + encodeURIComponent(folder)
  }).done(function(html){

    $('main').html(html);
    fixScrollHeight();
    $('nav').find('.loading.browse').hide();
        
    $('#browse').find('.dir').find('a').off('click');
    $('#browse').find('.dir').find('a').on('click', function(e){
      e.preventDefault();
      renderBrowse($(this).attr('data-dir'));
    });
    $('#browse').find('.dir-info').find('a').off('click');
    $('#browse').find('.dir-info').find('a').on('click', function(e){
      e.preventDefault();
      renderBrowse("--" + $(this).attr('data-dir'));
    });

    // register Buttons
    $('#browse').on('click', '.append.button', function(){
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'add', [dir], function(err,msg){
        if (err) {
          console.log(err);
        }
        else {
          $('nav').find('.button').removeClass('active');
          $('nav').find('.button.queue').addClass('active');
          renderQueue();
        }
      });
    });

    $('#browse').find('.load.button').off('click');
    $('#browse').find('.load.button').on('click', function(){
      var dir = $(this).parents('.dir').attr('data-directory');
      socket.emit('mpd', 'clear', [], function(err,msg) {
        socket.emit('mpd', 'add', [dir], function(err,msg){
          if (err) {
            console.log(err);
          }
          else {
            $('nav').find('.button').removeClass('active');
            $('nav').find('.button.queue').addClass('active');
            renderQueue();
          }
        });
      });
    });
  });
}

function renderSearch(searchString, searchType) {
  $('nav').find('.button').removeClass('active');
  $('nav').find('.button.search').addClass('active');
  $('nav').find('.loading.search').show();
  
  if (searchString === "" || searchString === " " ) {
    searchString = "#";
  }
  $.ajax({
    url: 'search/' + encodeURIComponent(searchString) + "/" + searchType
  }).done(function(html){

    $('main').html(html);
    fixScrollHeight();
    $('nav').find('.loading.search').hide();  

    // register Buttons
    $('#search').on('change', 'select', function() {
      var searchString = $('#search').find('input.search-input').val();
      var searchType = $('#search').find('select.search-select').val();
      renderSearch(searchString, searchType);
    });
    
    $('#search').on('keyup', 'input.search-input', function(e) {
      if ( e.which === 13 ) {
        var searchString = $('#search').find('input.search-input').val();
        var searchType = $('#search').find('select.search-select').val();
        renderSearch(searchString, searchType);
      }
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


  });
}

var registerButton = function(container, element, command, args, callback) {
  // register the interface via JQuery on method

  // container = JQuery Object containing the element
  // element = button identifier as String
  // command = mpd command as String
  // args = command args of type Array, optional
  container.on('click', element, function() {
    // fire mpd command with optional callback
    socket.emit('mpd', command, args, function(err,msg) {
      if (callback) {
        callback(err, msg);
      }
    });
  });
};

function initAudioElement(audio_element) {
  socket.emit('get_streaming_status', function(status) {
    //console.log(status);
    if (status === true && stream !== undefined) {
      // start streaming
      audio_element.play();
      $('#stream').addClass('active');
    }
  });
}

function getStreamingStatus() {
  socket.emit('get_streaming_status', function(streaming) {
    return streaming;
  });
}
function setStreamingStatus(status) {
  socket.emit('set_streaming_status', status);
}

function fixScrollHeight() {
  console.log($(window).height());
  console.log($('.scrollable').position().top);
  //var top = $('.scrollable').top();
  $('.scrollable').height($('main').height() - $('.scrollable').position().top);
}

function secondsToTimeString (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

function info(infotext) {
  $('body').prepend('<div class="infotext">' + infotext + '</div>');
}

function autoScrollQueue() {
  socket.emit('mpd', 'currentsong', [], function(err, song) {
    if (song) {
      var scrollable = $('#queue.scrollable');
      var scrolltop = $('.song.' + song.Id).offset().top +
          scrollable.scrollTop() -
          scrollable.offset().top;
      scrollable.animate({
        scrollTop: scrolltop
      }, 0);
    }
  });
}

function fetch_album_cover(artist, album) {
  $.ajax({
    url: 'http://www.musicbrainz.org/ws/2/recording/?query=artist:' + artist +
        '+recording:' + album
  }).done(function(data) {
    console.log(data);
    data = xmlToJson(data);
    console.log(data);
    console.log(data['metadata']['recording-list']['recording'][0]['release-list']['release']['@attributes']['id']);
    console.log(data['metadata']['recording-list']['recording'][0]['release-list']['release']['title']);
    url = null;
    return url;
  });
  
}

function xmlToJson(xml) {
    var obj = {};
    if (xml.nodeType == 1) {                
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { 
        obj = xml.nodeValue;
    }            
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}