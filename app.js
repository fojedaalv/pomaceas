require('dotenv').load();
var express = require('express');
var path = require('path');
var logger = require('morgan');
var debug = require('debug')('pomaceas:server');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');

require('./app_api/models/db');
require('./app_api/config/passport');

var pomaceasApiRouter = require('./app_api/routes/index');
var webAppRouter = require('./app_server/routes/index');

var app = express();
debug("Configuring Express app...");
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));
/*
app.use(passport.initialize());
*/
app.use('/', webAppRouter);
app.use('/api/v1', pomaceasApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

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

debug("Express app configured.");
module.exports = app;
