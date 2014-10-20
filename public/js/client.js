
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
    if (err) { console.log(err); }
    else if (queue) { queue.render(); }
  });
}

function playlistsRequest() {
  var p = new Playlists(function(err, playlists) {
    if (err) {console.log(err); }
    else if (playlists) { playlists.render(); }
  });
}
function browseRequest(folder) {
  var b = new Browse(folder, function(err, browse) {
    if (err) { console.log(err); }
    else if (browse) { browse.render(folder); }
  });
}
function searchRequest(searchString, searchType) {
  if (searchString === "" || searchString === " " ) {
    searchString = "#";
  }
  var s = new Search(searchString, searchType, function(err, search) {
    if (err) { console.log(err); }
    else if (search) { search.render(); }
  }
}

