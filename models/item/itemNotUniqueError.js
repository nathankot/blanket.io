'use strict';

function ItemNotUniqueError(message, existing) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.existing = existing;
}

ItemNotUniqueError.prototype = Object.create(Error.prototype);
ItemNotUniqueError.prototype.name = 'ItemNotUniqueError';

module.exports = ItemNotUniqueError;
