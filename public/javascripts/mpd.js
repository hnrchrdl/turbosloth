

var MpdAorta = function(callback) {
	//console.log('MpdAorta constructor called' );
	// Object with the current song and status
	var aorta = this;
	socket.emit('mpd', 'currentsong', [], function(err, data) {
		aorta.song = err ? err : data;
		socket.emit('mpd', 'status', [], function(err, data) {
			aorta.status = err ? err : data;
			callback(err, aorta);
		});
	});
};
var updateSongTime;
MpdAorta.prototype = {
	render : function() {
		//indicate status.state
		var status = this.status;
		var song = this.song;

		// hide all highlight markers fist
		$('.control-highlight').hide();

		// indicate the status (play, stop or pause) 
		$('#' + status.state + '-highlight').show();

		//indicate current status of random and repeat 
		if (status.random === '1') {
			$('#random-highlight').show();
		}
		if (status.repeat === '1') {
			$('#repeat-highlight').show();
		}

		//render current song
		if (status.state === 'stop') {
			$('#currentsong').text("");
		}
		else {
			console.log(status);
			$('#currentsong').html(song.Artist + 
				" - " + song.Title +
				' (<span id="elapsed">' + secondsToTimeString(status.elapsed) + '</span> : ' +
				secondsToTimeString(song.Time) + ')');
		}
		var currentTime = parseFloat(status.elapsed);
		clearInterval(updateSongTime);
		updateSongTime = setInterval(function(){
			currentTime += 1;
			$('#elapsed').text(secondsToTimeString(currentTime));
		}, 1000);
	},
	registerHandler : function() {
		
		var status = this.status;
		var song = this.song;

		var register = function(elementID, args) {
			// register the interface
			// via JQuery bind method
			$('#' + elementID).off('click');
			$('#' + elementID).on('click', function(){
				// fire mpd command w/o callback
				socket.emit('mpd',elementID,args);
			});
			
		}

		// set the args for random, repeat and pause
		var random = 1 - status.random;
		var repeat =  1 - status.repeat;
		var pause = status.state === 'pause' ? 0 : 1;
		
		var handlerList = [ 
			['previous', []],
			['next', []], 
			['play', []], 
			['stop', []],
			['random', [random]],
			['repeat', [repeat]],
			['pause', [pause]] 
		];
		for (i in handlerList) {
			register(handlerList[i][0], handlerList[i][1]);
		}
		
		// register the seek function on the playlist-container
		$('#playlist-container').off('click');
		$('#playlist-container').on('click', function(e){
			var seek_ratio = 1 -(($(this).width() - e.clientX) / $(window).width()); 
			console.log(seek_ratio);
			var seek_sec = String(Math.round(seek_ratio * song.Time));
			socket.emit('mpd','seekcur',[seek_sec]);
		});
		
	},
	renderProgressBar : function() {
		var progressBar = $('#progress-bar');
		
		var start = function startProgressbar (songTime,elapsed) {
			
			var initial_width = elapsed / songTime * 100; 
			var duration = songTime - elapsed;
			progressBar
				.stop()
				.css('width',initial_width + '%')
				.animate({'width': '100%'},duration * 1000, 'linear');
		};
		var stop = function stopProgressBar () {
			progressBar.stop();
		};

		var status = this.status;
		switch (status.state) {
			case 'play':
				var songTime = parseFloat(status.time.split(":")[1]);
				var elapsed = parseFloat(status.elapsed);
				start(songTime,elapsed);
				break;
			case 'pause':
				stop();
				break;
			case 'stop':
				stop();
				progressBar.css('width',0);
		}
	},
	indicate : function() {
		var playIndicator = $('<td class="playindicator"><span class="glyphicon glyphicon-play-circle"></span></td>')
		$('.playlistrow').removeClass('highlight');
		$('#playlistrow-' + this.song.Id).addClass('highlight');	
	},
};

var MpdPlaylist = function(callback) {
	var playlist = this;
	$.ajax({
		url:'/mpdplaylist'
	})
	.done(function(data) {
		playlist.html = data;
		callback({},playlist);	
	})
	.fail(function(err) {
		callback(err,{});
	});
};

MpdPlaylist.prototype = {
	render : function() {
		$('#main').html(this.html);
		$('.playlistrow').find('.Time').each(function() {
			var songtime = $(this).text();
			$(this).text(secondsToTimeString(songtime));

		});

	},
	indicate : function() {
		var playIndicator = $('<td class="playindicator"><span class="glyphicon glyphicon-play-circle"></span></td>')
		$('.playlistrow').removeClass('highlight');
		socket.emit('mpd', 'currentsong', [], function(err,song) {
			//console.log(song);
			$('#playlistrow-' + song.Id).addClass('highlight');	
		});
	},
	registerFunctionality : function () {
		var playButton = ('<td class="playbutton"><span class="glyphicon glyphicon-play"></span></td>');
		// playbutton hover
		//$('.playlistrow').unbind('mouseenter');
		$('.playlistrow').bind('mouseenter', function() {
			if ($(this).find('.playindicator').length === 0) {
				$(this).find('.Pos')
					.after(playButton)
					.hide();
			}
		});
		//$('.playlistrow').unbind('mouseleave');
		$('.playlistrow').bind('mouseleave', function(){
			if ($(this).find('.playindicator').length === 0) {
				$(this).find('.playbutton').remove();
				$(this).find('.Pos').show();
			}
		});

		// playbutton click
		//$('.playbutton').off('click');
		$('.playlistrow').on('click','.playbutton', function() {
			console.log($(this));
			songid = $(this).parent().attr('id').split('-')[1];
			socket.emit('mpd', 'playid', [songid]);
		});

		// refresh playlist click
		//$('#refreshplaylist').off('click');
		$('#refreshplaylist').on('click',function() {
			//console.log(aorta);
			renderPlaylist();
		});

		// save playlist click
		var options = {
			html : true,
			content : '<div class="input-group">' +
  				'<input type="text" class="form-control" id="plsavetext">' +
  				'<span class="input-group-btn">' +
    			'<button class="btn btn-default" type="button" id="plsavebtn">save</button>' +
  				'</span>' +
				'</div><!-- /input-group -->',
			placement : 'bottom'
		};
		$('#saveplaylist').popover(options);
		$('#saveplaylist').off('click');
		$('#saveplaylist').on('click', function() {
			
			$('#saveplaylist').popover('toggle');

			$('#plsavebtn').off('click');
			$('#plsavebtn').on('click', function() {	
				socket.emit('mpd', 'save',[$('#plsavetext').val()]);
			});
		});
		

		// load playlist click
		$('#loadplaylist').off('click');
		$('#loadplaylist').on('click', function() {
			$('#playlistloadmodal').modal();
			socket.emit('mpd', 'listplaylists', [], function(err, data){
				for (i in data) {
					$('#playlistloadcontent').find('ul').append(
						'<li>' + 
						'<a href="" class="loadplaylist">' +
						 data[i].playlist +
						 '</a>' +
						'</li>'
					);
				}	
				$('.loadplaylist').on('click', function(e) {
					if ($('input[name=radio1]:checked').val() === 'replace') {
						socket.emit('mpd', 'clear', []);
					}
					socket.emit('mpd', 'load', [$(this).text()], function(err, msg) {
						renderAorta(true);
						
					});
					$('#playlistloadmodal').modal('hide');
					return false;
				});
				
			});
			$('#playlistloadmodal').modal('show');
		});

		$('#clearplaylist').off('click');
		$('#clearplaylist').on('click', function() {
			socket.emit('mpd', 'clear', [], function() {
				renderAorta(true);
			});
		});

		// scroll to current song
		//$('#scrolltocurrentsong').off('click');
		$('#scrolltocurrentsong').on('click',function() {
			socket.emit('mpd', 'currentsong', [], function(err, song) {
				var scrolltop = $('#playlistrow-' + song.Id).offset().top +
					$('.scrollable').scrollTop() -
					$('.scrollable').offset().top;			
				$('.scrollable').animate({
				scrollTop: scrolltop	
				},1000);
			});
		});
		//$('#scrolltotop').off('click');
		$('#scrolltotop').on('click',function() {		
			$('.scrollable').animate({
				scrollTop: 0	
				},1000);
		});
	}
};