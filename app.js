
/**
 * Module dependencies.
 */

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
  app.use(express.static(path.join(__dirname, 'web', 'dist')));
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
