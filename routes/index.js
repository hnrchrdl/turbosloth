var express = require('express');
var app = require('../app');
var router = express.Router();

var komponist = require('komponist');
var komponistClient;

var socketio = require('socket.io');
var io, socketEmit, sendMpdAorta, getKomponistClient;

//  ******************
//  *** the routes ***

router.get('/', function(req, res) {

	if (req.session.mpdhost && req.session.mpdport) {
		
		console.log(req.session.komponistClient);
		// create komponist from session
		
		// new session object is undefinded by default
			if (!komponistClient) {
				komponistClient = komponist.createConnection(
					req.session.mpdport,
					req.session.mpdhost
				);
				//komponistClient.pause(1);
			
				// register mpd listener for -ready- event
				console.log('komponist listener for -changed- registered');
				// unbind client first to avoid double registration
				komponistClient.on('ready', function(err,msg) {
					console.log('unbind komponist listener for -changed- event');
				});
				komponistClient.on('ready', function(err,msg) {
					if (req.session.mpdpassword) {
						komponistClient.password(req.session.mpdpassword, function(err,msg){
							if (err) console.log(err); 
							else console.log('mpd authenticated');
						});
					}
				});

				// register mpd listener for -changed- event
				console.log('komponist listener for -changed- registered');
				komponistClient.on('changed', function(system) {
					console.log('Subsystem changed: ' + system);
					if (system == 'player' || system == 'options') {
						sendMpdAorta('changed');
					}
				});
			}
		
		//render skeleton
		res.render('app', { 
			title: 'leukosia node', 
			mpdhost: req.session.mpdhost,
			mpdport: req.session.mpdport
		});
	}
	else {
		console.log('no session found');
		res.render('index', { title: 'leukosia node' });
	}

});

router.post('/', function(req, res) {
	req.session.mpdhost = req.body.mpdhost;
	req.session.mpdport = req.body.mpdport;
	req.session.mpdpassword = req.body.mpdpassword,
	res.redirect('/');
});


router.get('/mpdplaylist', function(req,res) {
	columns = ['Pos', 'Title', 'Artist', 'Album', 'Genre', 'Time']
	komponistClient.playlistinfo(function(err,data) {

		res.render('playlist',{playlist:data,columns:columns});
	});	
});




// *************************
// *** set up the socket ***

var listen = function(app) {

	//var komponistClient = get_or_set_komponistClient();

	io = socketio.listen(app);
	//var komponistClient = getKomponistClient();
	
	io.sockets.on('connection', function (socket) {
		console.log('A socket connected');
		
		socket.on('requestMpdAorta', function() {
			// sends the App Aorta
			sendMpdAorta('init');
		});

		
		socket.on('mpdCommand', function(msg) {
			// listens for Mpd Commands

			console.log('cmd: ' + JSON.parse(msg).cmd);
			console.log('args: ' + JSON.parse(msg).args);

			// cmd is the mpd command as a String 
			cmd = JSON.parse(msg).cmd;
			// args are the optional commands as Array
			args = JSON.parse(msg).args;

			komponistClient.command(cmd,args,function(err,msg) {
				console.log(err);
				console.log(msg);		
			});
		});


		sendMpdAorta = function (source) {
			// sends the App Aorta
			// this is done when side is lodaed
			// or something on Mpd has happend

			console.log('mpd aorta has been requested');
			komponistClient.status(function(err,msg) {
				
				// extract status
				var status = JSON.stringify(msg);
				komponistClient.currentsong(function(err,msg) {
										
					// extract current song
					currentsong = JSON.stringify(msg);
					console.log(status);
					console.log(currentsong);
					// emit data to client 
					socket.emit('sendMpdAorta', {
						source:source,
						status:status,
						currentsong:currentsong 
					});
				});
			});
		}
	});
	
	// make io availible to other modules
	return io;	
}


module.exports = {
    listen: listen,
    router: router
}
//module.exports = router;