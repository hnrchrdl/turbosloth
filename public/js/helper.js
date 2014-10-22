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
  console.log($('main').height());
  console.log($('.scrollable').position().top);
  $('.scrollable').height($('main').height() - $('.scrollable').position().top);
}

function secondsToTimeString (seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

function info(infotext) {
  $('body').prepend('<div class="infotext">' + infotext + '</div>');
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

