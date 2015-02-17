# turbosloth
webinterface for mpd

Installation
-----------------
* prerequisites: [node.js](http://nodejs.org/) and [redis](http://redis.io/)
* globally install express through npm: `npm install -g express`
* install npm dependencies: `npm install`
* copy the *config.json.tmp*, rename your copy *config.json* and adjust it to your need
* run `gulp` to for build and watch
* run `NODE_ENV=development node app.js` or `NODE_ENV=production node app.js`
