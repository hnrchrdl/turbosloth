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

  // init handlers
  initHandlers();
  
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



function playerHasChanged(init) {
  var a = new Aorta(function(data) {
    if (data) {
      registerMpdInterface(data.status);
      renderCurrentSong(data.status, data.song);
      renderProgressBar(data.status);
      init ? queueRequest() : highlightSongInQueue(data.song);
    }
  });
}

function queueRequest() {
  var q = new Queue(function(err, queue) {
    if (queue) { queue.render(); }
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
