var LastAlbum = function(artist, album, callback) {
  l = this;
  $.ajax({
    url: '/lastfmalbum/' + 
        encodeURIComponent(artist) + '/' +
        encodeURIComponent(album) 
  }).done(function(data) {
    l.data = $.parseJSON(data);
    return callback(null, l);
  }).fail(function(err, data) {
    l.data = false;
    return callback(err, l);
  });
};
LastAlbum.prototype.getAlbumArt = function(size) {
  try { 
    return this.data.album.image[size]['#text'];
  }
  catch(e) {
    console.log('error fetching albumm art: ' + e);
    return false;
  }
};
var LastArtist = function(artist, album) {
  
};