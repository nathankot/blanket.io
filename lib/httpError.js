'use strict';

function HttpError(message, status) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.status = status;
}

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.name = 'HttpError';

module.exports = HttpError;
