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
			}
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
					sendMpdAorta();
				}
			});
		
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

	// global function to make Komponist CLient available
	//getKomponistClient = function () {
	//		return komponistClient;
	//}
});

router.post('/', function(req, res) {
	req.session.mpdhost = req.body.mpdhost;
	req.session.mpdport = req.body.mpdport;
	req.session.mpdpassword = req.body.mpdpassword,
	res.redirect('/');
});

// router.get('/mpdcommand/:name', function(req,res)  {
// 	komponistClient[req.param("name")] (function(err,data) {
// 		if (data && data != {}) {
// 			//console.log(data);
// 			res.json(JSON.stringify(data));
// 		}
// 		else {
// 			res.write("OK");
// 		}
// 	});
// });

router.get('/mpdplaylist', function(req,res) {
	columns = ['Artist', 'Title', 'Album', 'Genre', 'Time']
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
			sendMpdAorta();
		});

		
		socket.on('mpdCommand', function(msg) {
			// listens for Mpd Commands

			console.log('cmd: ' + JSON.parse(msg).cmd);
			console.log('args: ' + JSON.parse(msg).args);

			// cmd is the mpd command as a String 
			cmd = JSON.parse(msg).cmd;
			// args are the optional commands as Array
			args = JSON.parse(msg).args;

			komponistClient[cmd]([args],function(err,msg) {
				console.log(err);
				console.log(msg);		
			});
			
/*			//console.log(args.length);
			if (args.length === 0 ) {
				// execute mpd command WITHOUT args
				komponistClient[cmd](function(err,msg) {
				console.log(err);
				console.log(msg);
					
				});
			}
			else if (args.length === 1 ) {
				// execute mpd command WITH ONE arg
				komponistClient[cmd](args[0],function(err,msg) {
				console.log(err);
				console.log(msg);

				});
			}
			else if (args.length === 2 ) {
				// execute mpd command WITH TWO arg
				komponistClient[cmd](args[0],args[1],function(err,msg) {
				console.log(err);
				console.log(msg);

				});
			}*/
		});


		sendMpdAorta = function () {
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

					// emit data to client 
					socket.emit('sendMpdAorta', {
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

function get_or_set_komponistClient() {
	if (!komponistClient) {
			komponistClient = komponist.createConnection(
				req.session.mpdport,
				req.session.mpdhost
		);
	}
	return komponistClient;
}


module.exports = {
    listen: listen,
    router: router
}
//module.exports = router;