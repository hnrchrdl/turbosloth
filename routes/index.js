var express = require('express');
var app = require('../app');
var router = express.Router();

var komponist = require('komponist');
var komponistClient = false;

var socketio = require('socket.io');
var io, emitChange;

//  ******************
//  *** the routes ***

router.get('/', function(req, res) {

	if (req.session.mpdhost && req.session.mpdport) {
		
		// create komponist from session
		// new session object is undefinded by default
		if (!komponistClient) {
			komponistClient = komponist.createConnection(
				req.session.mpdport,
				req.session.mpdhost
			);
		}
		// register mpd listener for -ready- event

		//komponistClient.removeAllListeners('ready');
		komponistClient.on('ready', function(err, msg) {
			if (req.session.mpdpassword) {
				komponistClient.password(req.session.mpdpassword, function(err,msg){
					if (err) console.log(err); 
					else console.log('mpd authenticated');
				});
			}
		});

		// register mpd listener for -changed- event
		komponistClient.removeAllListeners('changed');
		komponistClient.on('changed', function(system) {
			console.log('Subsystem changed: ' + system);
			if (system == 'player' || system == 'options') {
				emitChange(system);
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

});

router.post('/', function(req, res) {
	req.session.mpdhost = req.body.mpdhost;
	req.session.mpdport = req.body.mpdport;
	req.session.mpdpassword = req.body.mpdpassword,
	res.redirect('/');
});


router.get('/mpdplaylist', function(req,res) {
	columns = ['Pos', 'Title', 'Artist', 'Album', 'Genre', 'Time']
	komponistClient.playlistinfo(function(err, data) {
		res.render('playlist',{playlist:data,columns:columns});
	});	
});

router.get('/logout', function(req,res) {
	req.session.destroy();
	res.redirect('/');
});



// *************************
// *** set up the socket ***

var listen = function(app) {

	//var komponistClient = get_or_set_komponistClient();

	io = socketio.listen(app);
	//var komponistClient = getKomponistClient();
	
	io.sockets.on('connection', function (socket) {
		console.log('A socket connected');

		
		socket.on('mpd', function(cmd,args,callback) {
			komponistClient.command(cmd,args,function(err,msg) {
				if (err) console.log('mpd-error: ' + err)
				if (callback) callback(err, msg);
			});
		});

		emitChange = function (system) {

			// sends the mpd system change to the browser
			// this is done when side is lodaed
			// or something on Mpd has happend
 			socket.emit('change',system);
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