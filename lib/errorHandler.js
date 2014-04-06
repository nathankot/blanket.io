'use strict';

var parseMongooseErrors = require('./parseMongooseErrors.js');

module.exports = function () {

  return function (err, req, res, next) {

    var code, messages;

    // HTTP error, thrown by route.
    if (err.name === 'HttpError' && err.status) {
      code = err.status;
      if (err.messages.length > 0) { messages = err.messages; }
      else { messages = [err.message]; }

    // Validation error, thrown by mongoose.
    } else if (err.name === 'ValidationError') {
      code = 422;
      messages = parseMongooseErrors(err);

    // Unknown error, defer.
    } else {
      return next(err);
    }

    res.send(code, messages);

  };

};
