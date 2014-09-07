//app = require('express.io')()
var express = require('express');
var app = express();
var http = require('http');

var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var redis = require('redis');
var redisClient = redis.createClient(6379, 'localhost');


server = http.createServer(app);
//var io = require('socket.io').listen(server);

server.listen(8080, function() {
  console.log('listening on *:8080');
});

var io = require('./routes/index').listen(server);

var routes = require('./routes/index').router;
//var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser('a4f8071f-c873-4447-8ee2'));
//app.use(function(req, res, next){
//   res.end(JSON.stringify(req.cookies));
//});
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

//make routes accessible
app.use('/', routes);
//app.use('/mpdplaylist', routes);
//app.use('/logout', routes)


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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

module.exports = app;
//exports.app = app;
//exports.io = io;
//exports.server = server;