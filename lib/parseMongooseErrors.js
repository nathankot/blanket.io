'use strict';

var util = require('util');
var messages = {
  'required': '%s is required.',
  'min': '%s below minimum.',
  'max': '%s above maximum.',
  'enum': '%s not an allowed value.',
  'unique': '%s already exists.',
  'unupdatable': '%s cannot be updated.',
  'user defined': '%s'
};

module.exports = function parseMongooseErrors(err) {
  if (err.name !== 'ValidationError') { return []; }

  var errors = [];

  Object.keys(err.errors).forEach(function (field) {
    var eObj = err.errors[field];
    var key;

    if (messages.hasOwnProperty(eObj.type)) {
      key = eObj.type;
    } else if (messages.hasOwnProperty(eObj.message)) {
      key = eObj.message;
    } else {
      errors.push(eObj.message);
    }

    if (key) {
      errors.push(util.format(messages[key], eObj.path));
    }
  });

  return errors;
};
