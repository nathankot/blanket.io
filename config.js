'use strict';

var config = {
  MONGO_URL: process.env.MONGO_URL ||
             process.env.MONGOHQ_URL ||
             'localhost'
};

module.exports = config;
