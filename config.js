'use strict';

var config = {
  MONGO_URL: (function() {
    return process.env.MONGO_URL ||
      process.env.MONGOHQ_URL ||
      'mongodb://localhost/rss';
  })()
};

module.exports = config;
