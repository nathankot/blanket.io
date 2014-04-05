var mongoose = require('mongoose');
var mongooseTypes = require('nifty-mongoose-types');

module.exports = function() {
  // Load additional types
  mongooseTypes.loadTypes(mongoose);
};
