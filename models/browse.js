var mpd = require('../lib/mpd');


/**
* fetch the browse contents from mpd
* @param options {Object} 
* @param callback {Function}
*/
module.exports.fetchFromMpd = function(options, callback) {
  console.log('get browse from mpd. url: ' + options.args[0]);
  mpd.fireCommand(options, function(err, data) {
    if (err) return res.render('browse', {dirs:[], files:[], breadcrumbs:false});
    var dirs = [], files = [];
    // if contents contains only 1 item, mpd returns Object instead of Array
    contents = (data instanceof Array) ? data : [data];
    if (contents.length > 1) {
      for (i in contents) {
        var item = contents[i];
        if ('directory' in item) { // handle directory element
          try {
            var dir_split = item.directory.split('/');
            item.name = dir_split[dir_split.length-1];
            if (item.name !== "") {
              dirs.push(item); //push item into dirs array
            }
          }
          catch(e) {
            console.log(e);              
          }
        } else if ('file' in item) { // handle file element
          try {
            var dir_split = item.file.split('/');
            item.name = dir_split[dir_split.length-1];
            if (item.name !== "") {
              files.push(item); //push item into files array
            }
          }
          catch(e) {
            console.log(e);              
          }
        }
      }
    }
    //var breadcrumbs = browsepath.split('/');
    var breadcrumbs = false;
    var result = {};
    result.dirs = dirs;
    result.files = files;
    result.breadcrumbs = breadcrumbs;
    callback(null, result)
  });
};