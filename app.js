'use strict';

var _ = require('lodash'),
    cluster = require('cluster'),
    errorHandler = require('./lib/errorHandler.js');

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length,
      jobWorkerCount = 0;

  // Kick off with some forks =- =- =-
  _.times(cpuCount, function() { cluster.fork(); });

  cluster.on('disconnect', function(worker) {
    var timeout;
    console.error('Worker ' + worker.id + ': disconnected.');
    // 2 seconds grace before we kill any running stuffz
    timeout = setTimeout(function() { worker.kill(); }, 2000);
    worker.on('exit', function() { clearTimeout(timeout); });
    cluster.fork();
  });

  cluster.on('online', function(worker) {
    console.info('Worker ' + worker.id + ': online.');
    // We only need a single 'job worker' per server
    if (jobWorkerCount <= 0) {
      worker.send('start job worker');
      worker.on('disconnect', function() { --jobWorkerCount; });
      jobWorkerCount++;
    }
  });
} else {
  require('./db.js');

  var express = require('express');
  var http = require('http');
  var path = require('path');
  var app = express();

  // all environments
  app.set('port', process.env.PORT || 3666);
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);

  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    app.use(express.static(path.join(__dirname, 'web', 'dev')));
  } else {
    app.use(errorHandler());
    app.use(express.static(path.join(__dirname, 'web', 'dist')));
  }

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

  process.on('message', function(message) {
    if (message === 'start job worker') {
      console.info('Job work should be starting ...');
    }
  });
}
