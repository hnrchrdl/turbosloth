var socket = io();
var __aorta, __playlist, audio;

jQuery.fx.interval = 100;

$(document).ready(function() {

  var init = true;
  renderAorta(init);
  // make sure the komponist client is created on server
  // on first call only
  setTimeout(function() {
    renderAorta(init);
    //$(window).on('resize', function() {
    //  setHeightOfScrollable();
    //  registerButtonStyles();
    //});
  }, 1000);
  

  $(window).resize(function() {
    fixScrollHeight();
  });
  
  // play the audio element on start
  audio = document.getElementsByTagName("audio")[0];
  socket.emit('get_streaming_status', function(status) {
    console.log(status);
    if (status === true && stream !== undefined) {
      // start streaming
      audio.play();
      $('#stream').addClass('active');
    }
  });

  
  $('#logout').on('click', function(){
    window.location = '/logout';
  });

  $('#stream').on('click', function() {
    if (stream !== undefined) {
      socket.emit('get_streaming_status', function(status) {
        console.log(status);
        if (status === true) {
          // stop streaming
          audio.pause();
          $('#stream').removeClass('active');
          audio.src = "";
          socket.emit('set_streaming_status', false);
        }
        else {
          // start streaming
          audio.src = stream;
          audio.load();
          audio.play();
          $('#stream').addClass('active');
          socket.emit('set_streaming_status', true);
        }
      });
    }
  });

});

socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (){
  console.log('established socket connection');
});

socket.on('change', function(system) {
  console.log('subsystem changed: ' + system);
  var init = false;
  renderAorta(init);
});

function renderAorta(init) {
  __aorta = new MpdAorta(function(err, aorta) {
    console.log('rendering aorta');
    aorta.render();
    aorta.registerHandler();
    aorta.renderProgressBar();
    init ? renderPlaylist() : aorta.indicate();
  });
}

function renderPlaylist() {
  __playlist = new MpdPlaylist(function(err, playlist) {
    playlist.render();
    playlist.indicate();
    playlist.registerFunctionality();
    fixScrollHeight();
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
  console.log('fix');
  $('main').find('.scrollable').height($('main').height() - 65);
}

function secondsToTimeString (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

function info(infotext) {
  $('body').prepend('<div class="infotext">' + infotext + '</div>');
}