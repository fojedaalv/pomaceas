var mongoose = require('mongoose');
//mongoose.set('debug', true);
var dbpath = 'mongodb://localhost/pomaceas';
if (process.env.NODE_ENV === 'production') {
  dbpath = process.env.MONGODB_URI;
}
mongoose.connect(dbpath);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbpath);
});

mongoose.connection.on('error', function(err){
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('dissconnected', function(){
  console.log('Mongoose dissconnected');
});

var gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', function () {
  gracefulShutdown('app termination', function () {
    process.exit(0);
  });
});

process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
  });
});

require('./users');
require('./stations');
require('./sensor-data');
require('./password-requests');
require('./summaries');
