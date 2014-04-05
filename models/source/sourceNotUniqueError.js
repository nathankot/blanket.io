'use strict';

function SourceNotUniqueError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}

SourceNotUniqueError.prototype = Object.create(Error.prototype);
SourceNotUniqueError.prototype.name = 'SourceNotUniqueError';

module.exports = SourceNotUniqueError;
