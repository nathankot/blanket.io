'use strict';

var mongoose = require('mongoose');
var config = require('./config');

require('./config/mongoose.js')();
module.exports = mongoose.connect(config.MONGO_URL).connection;

