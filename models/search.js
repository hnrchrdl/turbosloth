var mpd = require('../lib/mpd');
var _ = require('underscore');


module.exports.searchRequest =  function(options, callback) {

  mpd.fireCommand(options, function(err, data) {
  
    if (err) return callback(err, null);
  
    if ( _.isEmpty(data[0] )) {
      var err = 'sorry, no results found for ' + 
            options.args[1] + ' as ' +
            options.args[0];
      return callback(err, null);
    }

    var groups = _.groupBy(data, function(song) { // group songs by artist
      if ('Artist' in song && song.Artist !== "") return song.Artist; 
    });
    var artists = _.map(groups, function(group){ // get genres and songcount for artist
      var artist = { 
        name : group[0].Artist,
        genres : _.uniq(_.pluck(group, 'Genre')),
        songcount : group.length
      };
      return artist;
    });
    try {
      var sortedArtists = _.sortBy(artists, function(artist) {
        return -parseInt(artist.songcount);
      }); //higher rank for artists with more songs
    } catch(e) {}
    //only first 5 elements
    sortedArtists = sortedArtists.slice(0, Math.min(sortedArtists.length, 5));
    return callback(null, sortedArtists);
  });
};


/**
*** render Artist Details
**/
module.exports.getAlbumsFromArtist = function(options, callback) {

  mpd.fireCommand(options, function(err, data) {
    console.log(options, err, data);
    
    if (err) return callback(err, null);
  
    if ( _.isEmpty(data[0] )) return callback(null, []);

    var albums = _.groupBy(data, function(song) {
      if ('Album' in song && song.Album != "") 
        return song['Album'].toLowerCase();
    });
    
    return callback(null, albums);
  });
};