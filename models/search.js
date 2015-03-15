var mpd = require('../lib/mpd');
var _ = require('underscore');


module.exports.searchRequest =  function(options, callback) {

  mpd.fireCommand(options, function(err, data) {
  
    if (err) return callback(err, null);
  
    if ( _.isEmpty(data[0] )) {
      var err = 'nothing found';
      return callback(err, null);
    }

    // if Artist
    if (options.args[0] === 'Artist') {

      var groups = _.groupBy(data, function(song) { // group songs by artist
        if ('Artist' in song && song.Artist !== "" && typeof song.Artist != 'undefined') {
          return song.Artist;
        }
      });
      var artists = _.map(groups, function(group){ // get genres and songcount for artist
        var artist = { 
          name : group[0].Artist,
          genres : _.filter(_.uniq(_.pluck(group, 'Genre')), function(item) { 
            return typeof item != 'undefined' && item !== ""; 
          }),
          songcount : group.length
        };
        return artist;
      });
      var sortedArtists;
      try {
        var sortedArtists = _.sortBy(artists, function(artist) {
          return -parseInt(artist.songcount);
        }); //higher rank for artists with more songs
      } catch(e) {}
      //only first 5 elements
      sortedArtists = sortedArtists.slice(0, Math.min(sortedArtists.length, 5));
      return callback(null, sortedArtists);

    // if Album
    } else if (options.args[0] === 'Album') {
      var albumgroups = _.groupBy(data, function(song) { // group songs by artist
        if ('Album' in song && 'Artist' in song && 
          song.Album !== "" && song.Artist !== "" && 
        typeof song.Artist != 'undefined' && typeof song.Album != 'undefined') {
          return song.Album;
        }
      });
      var albums = _.map(albumgroups, function(group) {
        var album = {
          name: group[0].Album,
          artist: group[0].Artist,
          genres: _.filter(_.uniq(_.pluck(group, 'Genre')), function(item) {
            return typeof item != 'undefined' && item != '';
          }),
          songcount: group.length
        };
        return album;
      });
      var sortedAlbums;
      try {
        sortedAlbums = _.sortBy(albums, function(album) {
          return -parseInt(album.songcount);
        }); //higher rank for albums with more songs
      } catch(e) {}
      sortedAlbums = sortedAlbums.slice(0, Math.min(sortedAlbums.length, 5));
      return callback(null, sortedAlbums);
    }
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
      if ('Album' in song && song.Album != "" && typeof song.Album != 'undefined') {
        return song['Album'].toLowerCase();
      }
    });
    
    return callback(null, albums);
  });
};