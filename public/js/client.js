var socket = io();
var __aorta, __playlist;

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
  }, 2000);
  
  $('#logout').on('click',function(){
    window.location = '/logout';
  });

  $(window).resize(function() {
    fixScrollHeight()
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

function fixScrollHeight() {
  console.log('fix');
  $('main').find('.scrollable').height($('main').height() - 40);
}

function secondsToTimeString (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}