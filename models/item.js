'use strict';

var mongoose = require('mongoose'),
    normalizeUrl = require('../lib/normalizeUrl.js');

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
    this.url = normalizeUrl(this.url);
    done();
  });

  return schema;

})());
