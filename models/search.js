var mpd = require('../lib/mpd');
var _ = require('underscore');


module.exports.searchRequest =  function(options, callback) {

  mpd.fireCommand(options, function(err, data) {
  
    if (err) return callback(err, null);
  
    if ( _.isEmpty(data[0] ))  return callback(null, null);

    var groups = _.groupBy(data, function(song){ // group songs by artist
      if (song &&  song.Artist && song.Artist !== "") return song.Artist; 
    });
    var result = _.map(groups, function(group){ // get genres and songcount for artist
      var artist = { 
        name : group[0].Artist,
        genres : _.uniq(_.pluck(group, 'Genre')),
        songcount : group.length
      };
      return artist;
    });
    _.sortBy(result, 'songcount'); //higher rank for more artist with more songs
    return callback(null, result);
  });
};


/**
*** render Artist Details
**/
module.exports.getArtistDetails = function(options, callback) {

  mpd.fireCommand(options, function(err, data) {
    
    if (err) return callback(err, null);
  
    if ( _.isEmpty(data[0] )) return callback(null, null);

    // todo : better coding with underscore...
    // this is ugly
    var album_names = [];
    albums = [];
    var others = [];
    for (i in data) {
      var item = data[i]; 
      if ('Album' in item) {
        var album_name = item.Album;
        if (album_names.indexOf(album_name) === -1) {
          album_names.push(album_name);
          albums.push({name: album_name, songs: [item]});
        }
        else {
          for (i in albums) {
            var album = albums[i];
            if (album_name === album.name) {
              album.songs.push(item);
            } 
          }
        }
      }
      else {
        others.push(item);
      }
    }
    return callback(null, {
      albums: albums, 
      songs: songs
    });
  });
};