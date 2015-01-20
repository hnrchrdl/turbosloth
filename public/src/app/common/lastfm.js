// get Artist from Artistname

var LastArtist = function(artist, callback) {
  lastartist = this;
  $.ajax({
    dataType: "json",
    url: '/lastfm-artist/',
    data : { artist : artist }
  }).done(function(data) {
    data ? lastartist.data = data : lastartist.data = null;
    return callback(null, lastartist);
  }).fail(function(err, lastartist) {
    lastartist.data = null;
    return callback({error: 'last fm error'}, lastartist);
  });
};

LastArtist.prototype.getImageURL = function(size) {
  if (this && this.data.artist.image[size]['#text']) { 
    var url = this.data.artist.image[size]['#text'];
    return url;
  }
  else {
    return "";
  }
};

LastArtist.prototype.getBio = function() {
  if (this && this.data.artist.bio.summary) {
    var summary = this.data.artist.bio.summary;
    return summary;
  }
  else {
    return "";
  }
};

LastArtist.prototype.getGenre = function() {
  if (this && this.data.artist.tags.tag) {
    var tags = this.data.artist.tags.tag;
    var genres = [];
    for (i in tags) {
      genres.push(tags[i].name);
    }
    return genres.join(', ');
  }
  else {
    return "";
  }
}


// get Album from Artist and Album

var LastAlbum = function(artist, album, callback) {

  lastalbum = this;
  if (artist === "" || album === "") {
    lastalbum.data = null;
    return callback({error: 'artist or album empty'}, lastalbum);
  }
  $.ajax({
    dataType: "json",
    url: '/lastfm-album/',
    data : {
      artist : artist,
      album : album
    }  
  }).done(function(data) {
    data ? lastalbum.data = data : lastalbum.data = null;
    return callback(null, lastalbum);
  }).fail(function(err, data) {
    lastalbum.data = null;
    return callback({error: 'last fm error'}, lastalbum);
  });
};

LastAlbum.prototype.getArtURL = function(size) {
  if (this && this.data ) {
    return this.data.album.image[size]['#text'];
  }
  else {
    return '';
  }
};

// get Top Albums from Artist

var LastTopAlbums = function(artist, callback) {
  lasttopalbum = this;
  $.ajax({
    dataType: "json",
    url: '/lastfm-topalbums/',
    data : {artist : artist }
  }).done(function(data) {
    data ? lasttopalbum.data = data : lasttopalbum.data = null;
    return callback(null, lasttopalbum);
  }).fail(function(err, data) {
    lasttopalbum.data = null;
    return callback({error: 'last fm error'}, lasttopalbum);
  });
};
LastTopAlbums.prototype.get = function() {
  if (this.data.topalbums.album) {
    var albums = this.data.topalbums.album;
    return albums.length > 1 ? albums : [albums];
  }
  else {
    return "";
  }
};

var LastSimilar = function(artist, q, callback) {
  lastsimilar = this;
  $.ajax({
    dataType: "json",
    url: '/lastfm-similar/',
    data : { 
      artist : artist,
      quantity : q 
    }
  }).done(function(data) {
    data ? lastsimilar.data = data : lastsimilar.data = null;
    return callback(null, lastsimilar);
  }).fail(function(err, data) {
    lastsimilar.data = null;
    return callback({error: 'last fm error'}, lastsimilar);
  });
};
LastSimilar.prototype.get = function() {
  if (this && this.data) {
    return this.data.similarartists.artist;
  }
  else {
    return "";
  }
};