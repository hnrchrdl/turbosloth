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

  $('.button.queue').on('click', function(){
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.queue').addClass('active');
    var init = true;
    renderAorta(init);
  });
  $('.button.playlists').on('click', function(){
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.playlists').addClass('active');
    renderPlaylists();
  });
  $('.button.browse').on('click', function(){
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.browse').addClass('active');
    renderBrowse("#");
  });
  $('.button.search').on('click', function(){
    $('nav').find('.button').removeClass('active');
    $('nav').find('.button.search').addClass('active');
    renderSearch("#", "any");
  });

  $('#stream').on('click', function() {

    if (stream !== undefined) {
      socket.emit('get_streaming_status', function(status) {
        //console.log(status);
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
    init ? renderQueue() : aorta.indicate();
  });
}

function renderQueue() {
  __playlist = new MpdPlaylist(function(err, playlist) {
    playlist.render();
    playlist.indicate();
    playlist.registerFunctionality();
    fixScrollHeight(35);
  });
}

function renderPlaylists() {
  // manage playlist click
  $.ajax({
    url: '/manageplaylist'
  }).done(function(html){
    // inject html
    $('main').html(html);
    fixScrollHeight(50);
    
    // register buttons
    $('#manageplaylist').find('.save.button').off('click');
    $('#manageplaylist').find('.save.button').on('click', function(){
      socket.emit('mpd', 'save', [$('#save-playlist').val()], function(err, msg){
        if (err) {
          console.log(err);
        }
        else {
          renderQueue();
        }
      });
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
  $.ajax({
    url: 'browse/' + encodeURIComponent(folder)
  }).done(function(html){
    $('main').html(html);
    fixScrollHeight(35);
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
    $('#browse').find('.append.button').off('click');
    $('#browse').find('.append.button').on('click', function(){
      var dir = $(this).parents('.dir').attr('data-directory');
      console.log(dir);
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
      console.log(dir);
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
  if (searchString === "") {
    searchString = "#";
  }
  $.ajax({
    url: 'search/' + encodeURIComponent(searchString) + "/" + searchType
  }).done(function(html){
    $('main').html(html);
    fixScrollHeight(50);

    // register Buttons
    $('#search').find('.search.button').off('click');
    $('#search').find('.search.button').on('click', function(){
      var searchString = $('#search').find('input.search').val();
      var searchType = $('#search').find('select.search').val();
      console.log(searchString);
      renderSearch(searchString, searchType);
    });

    $('#search').find('select.search').off('change');
    $('#search').find('select.search').on('change', function(){
      var searchString = $('#search').find('input.search').val();
      var searchType = $('#search').find('select.search').val();
      console.log(searchString);
      renderSearch(searchString, searchType);
    });
    $('#search').find('input.search').off('keyup');
    $('#search').find('input.search').on('keyup', function(e){
      if ( e.which === 13 ) {
        var searchString = $('#search').find('input.search').val();
        var searchType = $('#search').find('select.search').val();
        console.log(searchString);
        renderSearch(searchString, searchType);
      }
    });

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

function fixScrollHeight(minus) {
  console.log('fix');
  $('.scrollable').height($('main').height() - minus);
}

function secondsToTimeString (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

function info(infotext) {
  $('body').prepend('<div class="infotext">' + infotext + '</div>');
}

