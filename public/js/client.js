

//var socket = io();
var audio_element = document.getElementsByTagName("audio")[0];

//jQuery.fx.interval = 100;

$(document).ready(function() {

  $(document).on('resize', '.scrollable', function(){
    console.log('change');
  });

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
  //queueRequest('mpd');
}

function subsystemChange(system) {
  switch (system) {
    case 'player':
      currentSongRequest();
      break;
    case 'options':
      interfaceRegistration();
  
    case 'playlist':
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

function queueRequest(type) {
  new Queue(type, function(err, queue) {
    if (err) {
      showError('error rendering queue', 100000);
    }
    else { 
      queue.render();
    }
  });
}

function playlistsRequest(order) {
  new Playlists(order, function(err, playlists) {
    if (err) { console.log(err); }
    else { playlists.render(); }
  });
}

function playlistDetailsRequest(playlist) {
  new PlaylistDetails(playlist, function(err, playlist) {
    console.log(playlist);
    if (err) { console.log(err); }
    else { playlist.render(); }
  });
}

function browseRequest(folder, order) {
  if (!order) {
    order = 'none';
  }
  new Browse(folder, order, function(err, browse) {
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
