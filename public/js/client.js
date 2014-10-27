var socket = io();
var audio_element = document.getElementsByTagName("audio")[0];

jQuery.fx.interval = 100;

$(document).ready(function() {

  // fix window resize
  $(window).on('resize', function(){
    fixScrollHeight();
  });

  // init script
  initApp();
  // init the audio element on start
  initAudioElement(audio_element);

  // init handlers
  initHandlers();
  
});

function initApp () {
  currentSongRequest();
  queueRequest();
}

function subsystemChange(system) {
  switch (system) {
    case 'player':
      currentSongRequest();
      break;
    case 'options':
      interfaceRegistration();
  }
}

function currentSongRequest() {
  new CurrentSong(function(err , song) {
    if (err) { console.log(err); }
    else { 
      song.render();
    }
    interfaceRegistration();
    new Status(function(err, status) {
      status.renderProgressBar();
    });
  });
}

function queueRequest() {
  new Queue(function(queue) {
    if (queue) { 
      queue.render();
    }
    else {
      showInfo('error rendering queue', 2500);
    }
  });
}

function playlistsRequest() {
  var p = new Playlists(function(err, playlists) {
    if (playlists) { playlists.render(); }
    else if (err) { console.log(err); }
     
  });
}

function browseRequest(folder) {
  var b = new Browse(folder, function(err, browse) {
    if (browse) { browse.render(); }
    else if (err) { console.log(err); }
     
  });
}

function searchRequest(searchString, searchType) {
  if (searchString === "" || searchString === " " ) {
    searchString = "#";
  }
  try {
    var s = new Search(searchString, searchType, function(err, search) {
      if (search) { search.render(); }
      else if (err) { console.log(err); }
    });
  } 
  catch (e) {
    showInfo("search failed", 2500);
  }
}
