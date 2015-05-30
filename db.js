'use strict';

var mongoose = require('mongoose');
var config = require('./config');

require('./config/mongoose.js')();
module.exports = mongoose.connect(config.MONGO_URL).connection;

var path = require('path');
var fs = require('fs');
var models_path = path.join(__dirname, 'models');

fs.readdirSync(models_path).forEach(function (file) {
    if (file.match(/\.js$/)) {
        require(models_path+'/'+file);
    }
});
