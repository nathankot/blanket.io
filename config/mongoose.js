var mongoose = require('mongoose');
var mongooseTypes = require('nifty-mongoose-types');

module.exports = function(app) {
  // Load additional types
  mongooseTypes.loadTypes(mongoose);
};
