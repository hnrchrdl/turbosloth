var express = require('express');
var app = require('../app');
var router = express.Router();

//var io = require('../lib/sockets');
var socketio = require('socket.io');
var io, socket_emit;
//var io = socketio.listen(app);
//module.exports.listen = function(app){
var listen = function(app) {
	io = socketio.listen(app);
	io.sockets.on('connection', function (socket) {
		console.log('A socket connected!');
		//socket.on('documentReady', function() {
			
			//console.log('documentReady event');
			//socket.emit('changedPlayer', {status:'playing', etc:'etc'});
		//});
		socket_emit = function(name,data) {
			socket.emit(name,data);
		};
	});
	return io;
}

var komponist = require('komponist');
var komponistClient;
var mpdClient;


router.get('/', function(req, res) {

	if (req.session.mpdhost && req.session.mpdport) {
		
		//create komponist from session
		komponistClient = komponist.createConnection(
			req.session.mpdport,
			req.session.mpdhost
		);

		komponistClient.on('ready', function(err,msg) {
			if (req.session.mpdpassword) {
				komponistClient.password(req.session.mpdpassword, function(err,msg){
					if (err) console.log(err); 
					else console.log('mpd authenticated');
				});
			}
		});
		komponistClient.on('changed', function(system) {
			console.log('Subsystem changed: ' + system);
			if (system == 'player') {
				komponistClient.currentsong(function(err,data) {
					if (data && data != {}) {
						console.log(data);
						socket_emit('changedPlayer', JSON.stringify(data));
					}
					else {
						res.write("OK");
					}
				});
			}
		});
		
		//render page
		res.render('app', { 
			title: 'leukosia node', 
			mpdhost: req.session.mpdhost,
			mpdport: req.session.mpdport
			//mpdClient: mpd_client,
		});
	}
	else {
		res.render('index', { title: 'leukosia node' });
	}
});

router.post('/', function(req, res) {
	req.session.mpdhost = req.body.mpdhost;
	req.session.mpdport = req.body.mpdport;
	req.session.mpdpassword = req.body.mpdpassword,
	res.redirect('/');
});

router.get('/mpdcommand/:name', function(req,res)  {
	komponistClient[req.param("name")] (function(err,data) {
		if (data && data != {}) {
			//console.log(data);
			res.json(JSON.stringify(data));
		}
		else {
			res.write("OK");
		}
	});
});

router.get('/mpdplaylist', function(req,res) {
	komponistClient.playlistinfo(function(err,data) {
		res.render('playlist',{playlist:data});
	});	
});
module.exports = {
    listen: listen,
    router: router
}
//module.exports = router;