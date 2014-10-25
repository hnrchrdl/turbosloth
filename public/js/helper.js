function initAudioElement(audio_element) {
  socket.emit('get_streaming_status', function(status) {
    //console.log(status);
    if (status === true && stream !== undefined) {
      // start streaming
      audio_element.play();
      $('#stream').addClass('active');
    }
  });
}

function getStreamingStatus() {
  socket.emit('get_streaming_status', function(streaming) {
    return streaming;
  });
}
function setStreamingStatus(status) {
  socket.emit('set_streaming_status', status);
}

function fixScrollHeight() {
  try {
    $('.scrollable').height($('main').height() - $('.scrollable').position().top);
  } catch (err) { console.log(err); }
}

var timer;
function showInfo(text, duration) { 
  $('#info-wrapper').stop(true,true).fadeOut(1500);
  $('#info').html(text);
  $('#info-wrapper').show();
  clearTimeout(timer);
  //$('#info-wrapper').stop().fadeOut();
  timer = setTimeout(function() {
    $('#info-wrapper').fadeOut(1500);
  }, duration);
}

function fetch_album_cover(artist, album) {
  $.ajax({
    url: 'http://www.musicbrainz.org/ws/2/recording/?query=artist:' + artist +
        '+recording:' + album
  }).done(function(data) {
    console.log(data);
    data = xmlToJson(data);
    console.log(data);
    console.log(data['metadata']['recording-list']['recording'][0]['release-list']['release']['@attributes']['id']);
    console.log(data['metadata']['recording-list']['recording'][0]['release-list']['release']['title']);
    url = null;
    return url;
  });
}

function xmlToJson(xml) {
    var obj = {};
    if (xml.nodeType == 1) {                
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { 
        obj = xml.nodeValue;
    }            
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}