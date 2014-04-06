'use strict';

function HttpError(message, code) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.code = code;
}

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.name = 'HttpError';

module.exports = HttpError;
