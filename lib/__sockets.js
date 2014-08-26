/*var socketio = require('socket.io');
	//cookieParser = require('cookie-parser');


module.exports.listen = function(app){
	io = socketio.listen(app);

	io.set('authorization', function (data, accept) {
	// check if there's a cookie header
		if (data.headers.cookie) {
		// if there is, parse the cookie
			data.cookie = cookieParser(data.headers.cookie);
			console.log(cookieParser(data.headers.cookie));
			console.log(data.headers.cookie);
		// note that you will need to use the same key to grad the
		// session id, as you specified in the Express setup.
			//data.sessionID = data.cookie['express.sid'];
		} else {
		// if there isn't, turn down the connection with a message
		// and leave the function.
			return accept('No cookie transmitted.', false);
		}
		// accept the incoming connection
		accept(null, true);
	});

	io.sockets.on('connection', function (socket) {
		console.log('A socket connected!');
	//});
	//io.sockets.on('connection', function (socket) {
	//	console.log('A socket connected!');
		//socket.emit('news', { hello: 'world' });
		//socket.on('my other event', function (data) {
		//	console.log(data);
		//});
		socket.on('documentReady', function() {
			console.log('documentReady event');
			//socket.emit('changedPlayer', {status:'playing', etc:'etc'});
			//socket.emit('mpdPlaylist');
		});
	});
	return io
}*/