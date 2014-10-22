
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
  var a = new Aorta(function(a) {
    if (a) {
      registerMpdInterface(a.status);
      a.renderCurrentSong(a.status, a.song);
      a.renderProgressBar(a.status);
      init ? queueRequest() : a.highlightSongInQueue(a.song);
    }
  });
}

function queueRequest() {
  var q = new Queue(function(err, queue) {
    if (queue) { queue.render(); }
    else if (err) { console.log(err); }
     
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
  var s = new Search(searchString, searchType, function(err, search) {
    if (search) { search.render(); }
    else if (err) { console.log(err); }
  });
}
