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
  require('express-namespace');

  var express = require('express');
  var http = require('http');
  var path = require('path');
  var app = express();

  // all environments
  app.set('port', process.env.PORT || 3666);
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);

  app.use(function unprocessableErrorHandler(err, req, res, next) {
    if (err.name === 'ValidationError') {
      res.send(422, err);
    } else {
      next();
    }
  });

  if ('development' == app.get('env')) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
    app.use(express.static(path.join(__dirname, 'web', 'tmp')));
  } else {
    app.use(express.logger());
    app.use(errorHandler());
    app.use(express.static(path.join(__dirname, 'web', 'dist')));
  }

  (function setupRouting() {

    var sources = require('./routes/sources.js'),
        subscribers = require('./routes/subscribers.js');

    app.namespace('/api', function() {
      app.namespace('/v1', function() {
        app.post('/sources', sources.create);
        app.post('/subscribers', subscribers.create);
        app.get('/unsubscribe/:email', subscribers.destroy);
      });
    });

    // Setup email previewing route
    if ('development' == app.get('env')) {
      var helper = require('./spec/helper.js'),
          template = require('./lib/template.js');
      app.get('/dev/email/:type?', function(req, res, next) {
        helper.fakeItems()
        .then(function(items) {
          return template('digestv1', {
            items: items,
            subscriber: { email: 'test@email.com' }
          });
        })
        .then(function(meta) {
          res.send(200, (function() {
            if (req.params.type && req.params.type === 'text') {
              return meta.text;
            } else { return meta.html; }
          })());
        })
        .done();
      });
    }

  })();

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

  process.on('message', function(message) {
    if (message === 'start job worker') {
      console.info('Starting job worker...');

      var agenda = require('./lib/agenda.js'),
          digestJob = require('./jobs/digest.js');

      agenda.every('5 minutes', 'digest');
      agenda.start();
    }
  });
}
