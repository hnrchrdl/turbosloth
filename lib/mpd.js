var mpd = require('mpd');
cmd = mpd.cmd

module.exports.connect = function (host,port,password) {
	var mpd_client = mpd.connect({
		host:host,
		port:port
	});
	mpd_client.on('ready', function() {
		mpd_client.sendCommand(cmd("password", [password]), function(err, msg) {
		    if (err) throw err;
		    else {
		    	mpd_client.emit('authenticated');
		    }
		});
	});
	mpd_client.on('error', function(err){
		console.log(err);
	});
	return mpd_client
}

/*module.exports.status = function (mpdClient) {
	mpdClient.sendCommand(cmd("status",[]), function(err,data) {
		if (err)  throw err;
		else return(JSON.stringify(data));
		//console.log(data);
		//else return(data);
	});
}
*/