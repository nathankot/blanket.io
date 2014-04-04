'use strict';

var mongoose = require('mongoose');
var config = require('./config');

module.exports = mongoose.connect(config.MONGO_URL).connection;
