
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

