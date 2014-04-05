'use strict';

function SourceNotAccessibleError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}

SourceNotAccessibleError.prototype = Object.create(Error.prototype);
SourceNotAccessibleError.prototype.name = 'SourceNotAccessibleError';

module.exports = SourceNotAccessibleError;
