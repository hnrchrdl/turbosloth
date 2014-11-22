//var socket = io();
var audio_element = document.getElementsByTagName("audio")[0];

//jQuery.fx.interval = 100;

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
  new Queue(function(err, queue) {
    if (err) {
      showInfo('error rendering queue', 2500);
    }
    else { 
      queue.render();
    }
  });
}

function playlistsRequest(order) {
  var p = new Playlists(order, function(err, playlists) {
    if (err) { console.log(err); }
    else { playlists.render(); }
     
  });
}

function browseRequest(folder, order) {
  if (!order) {
    order = 'none';
  }
  var b = new Browse(folder, order, function(err, browse) {
    if (err) { console.log(err); }
    else { browse.render(); }
     
  });
}

function searchRequest (searchString, searchType) {
  if (!searchString) {
    searchString = "#";
  }
  if (!searchType) {
    searchType = 'Artist';
  }

  try {
    new Search(searchString, searchType, function(err, search) {
      if (err) { console.log(err); }
      else { search.render(); }
    });
  } 
  catch (e) {
    showInfo("search failed", 2500);
  }
}

function artistDetailsRequest (artist) {
  new ArtistDetails(artist, function(err, artistDetails) {
    if (err) {
      console.log(err);
    }
    else {
      artistDetails.render();
      artistDetails.lastArtist();
      artistDetails.lastAlbum();
      artistDetails.lastSimilar();
      artistDetails.lastTopAlbums();
    }
  });
}

function searchRequestFuzzy (searchString, searchType) {
  if (!searchString || searchString === "") {
    searchString = "#";
  }
  if (!searchType) {
    searchType = 'none';
  }
  try {
    new FuzzySearch(searchString, searchType, function(err, fuzzySearch) {
      if (err) { console.log(err); }
      else { fuzzySearch.render(); }
    });
  }
  catch (e) {
    showInfo("search failed", 2500);
  }
}
