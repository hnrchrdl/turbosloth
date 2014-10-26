var LastAlbum = function(artist, album, callback) {
  la = this;
  $.ajax({
    url: '/lastfmalbum/' + 
        encodeURIComponent(artist) + '/' +
        encodeURIComponent(album) 
  }).done(function(obj) {
    la.obj = $.parseJSON(obj);
  }).fail(function(err, obj) {
    la = false;
  }).always(function() {
    callback(la);
  });
};
LastAlbum.prototype.getAlbumArt = function(size) {
  console.log(this);
};
var LastArtist = function(artist, album) {
  
};