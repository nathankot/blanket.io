'use strict';

function SourceNotUniqueError(message, existing) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.existing = existing;
}

SourceNotUniqueError.prototype = Object.create(Error.prototype);
SourceNotUniqueError.prototype.name = 'SourceNotUniqueError';

module.exports = SourceNotUniqueError;
