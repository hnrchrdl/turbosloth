var express = require('express')
  , app = express()
  , http = require('http')
  , path = require('path')
  //, favicon = require('static-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , redis = require('redis')
  , server = http.createServer(app)
  , LastFmNode = require('lastfm').LastFmNode;
  //, passport = require("passport");
  
if (app.get('env') !== 'production') {
  require('longjohn'); // for detailed error logging in dev
}
 
var config = require('./config.json')[app.get('env')];
module.exports.config = config;

module.exports.lastfm = new LastFmNode({
  api_key: require('./config.json').lastfm.key,    // sign-up for a key at http://www.last.fm/api
  secret: require('./config.json').lastfm.secret,
  useragent: 'ts' // optional
});

//app.use(express.errorHandler(config.errorHandlerOptions));

redisClient = redis.createClient(config.redisPort, config.redisHost);
redisClient.select(config.redisDatabase);

server.listen(config.appPort, config.appHost, function() {
  console.log('listening on ' + config.appHost + ': ' + config.appPort);
});

var io = require('./lib/sockets').listen(server);

var routes = require('./routes/index').router;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('a4f8071f-c873-4447-8ee2'));
app.use(session({
  secret: 'a4f8071f-c873-4447-8ee2',
  key: 'express.sid',
  cookie: { maxAge: 2628000000 },
  store: new (require('express-sessions'))({
    storage: 'redis',
    instance: redisClient, // optional
    host: 'localhost', // optional
    port: 6379, // optional
    collection: 'sessions', // optional
    //expire: 86400 // optional
  }),
  resave: true,
  saveUninitialized: true
}));
//app.use(passport.initialize());
//app.use(passport.session());

// forward app config to res
app.use(function (req, res, next) {  
    res.locals.config = config;
    res.locals.secondsToTimeString = function(seconds) {
      var date = new Date(1970,0,1);
      date.setSeconds(seconds);
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    };
    next();
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || 'local') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
 
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports.app = app;
