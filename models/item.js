'use strict';

var mongoose = require('mongoose'),
    normalizeUrl = require('../lib/normalizeUrl.js'),
    ItemNotUniqueError = require('./item/itemNotUniqueError.js'),
    Q = require('q'),
    _ = require('lodash');

module.exports = mongoose.model('Item', (function() {

  var schema = mongoose.Schema({
    _source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
    url: { type: mongoose.SchemaTypes.Url, unique: true, required: true },
    title: String,
    summary: String,
    occurrences: { type: Number, default: 1 },
    views: Number,
    topics: Array,
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now }
  });

  schema.pre('validate', function(done) {
    if (this.isNew) {
      this.url = normalizeUrl(this.url);
    }
    done();
  });

  schema.pre('validate', function(done) {
    if (!this.isNew) { return done(); }

    Q.ninvoke(mongoose.model('Item'), 'find', { url: this.url })
    .then(function(items) {
      if (items.length === 0) {
        done();
      } else {
        throw new ItemNotUniqueError(
          'Item already exists',
          _.first(items)
        );
      }
    })
    .fail(function(err) { done(err); });
  });

  return schema;

})());
