'use strict';

var url = require('url'),
    _ = require('lodash');

module.exports = function(string) {
  // Assume http if nothing given
  if (!string.match(/^https?:\/\/.*/)) {
    string = 'http://' + 
             string.replace(/^\/+/, '')
                   .replace(/\/+$/, '');
  }

  var u = url.parse(string);
  return (u.protocol + '//' + u.host + u.pathname)
    .replace(/\/+$/, '');
};
