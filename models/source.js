'use strict';

var mongoose = require('mongoose'),
    request = require('request'),
    normalizeUrl = require('../lib/normalizeUrl.js'),
    SourceNotUniqueError = require('./source/sourceNotUniqueError.js'),
    SourceNotAccessibleError = require('./source/sourceNotAccessibleError.js'),
    Q = require('q'),
    _ = require('lodash'),
    cheerio = require('cheerio'),
    exec = require('child_process').exec,
    config = require('../config.js'),
    Item = require('./item.js'),
    sugar = require('sugar');

module.exports = mongoose.model('Source', (function() {

  var schema = mongoose.Schema({
    url: { type: mongoose.Schema.Types.Url, required: true, unique: true },
    title: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
    lastFetchedAt: { type: Date, default: null },
    fetchFrequency: { type: String, default: '6 hours' }
  });

  schema.pre('validate', function(next) {
    if (!this.isNew) { return next(); }

    this.normalize()
    .then(next)
    .fail(function(err) { next(err); });
  });

  schema.pre('validate', function(next) {
    if (!this.isNew) { return next(); }

    Q.ninvoke(mongoose.model('Source'), 'find', { url: this.url })
    .then(function(sources) { 
      if (sources.length === 0) {
        next();
      } else {
        throw new SourceNotUniqueError(
          'Source already exists',
          _.first(sources)
        );
      }
    })
    .fail(function(err) { next(err); });
  });

  /**
   * Normalizes the source url, stores the title if one is found.
   *
   * @throws SourceNotAccessibleError
   */
  schema.methods.normalize = function() {
    var deferred = Q.defer(),
        that = this;

    this.url = normalizeUrl(this.url);

    request(this.url, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        // Store the resolved uri
        that.url = response.request.uri.href;
        // Store the title if one is found
        var $ = cheerio.load(body), title = $('title').text();
        if (_.isEmpty(that.title) && !_.isEmpty(title)) { that.title = title; }

        deferred.resolve();
      } else {
        deferred.reject(new SourceNotAccessibleError());
      }
    });

    return deferred.promise;
  };

  /**
   * Returns the last # of items since a given time for this source.  It will
   * scrape for them if the source is out of date (determined by lastFetchedAt
   * and fetchFrequency.)
   */
  schema.methods.fetch = function(since) {
    since = since || Date.create('1 week ago');

    var source = this,
        deadline = (function() {
          if (!source.lastFetchedAt) { return Date.now(); }
          else { return source.lastFetchedAt.advance(source.fetchFrequency); }
        })(),
        isPastDeadline = Date.now() >= deadline;

    return Q.fcall(function() {
      if (isPastDeadline) { return source.scrape(); }
      else { return []; }
    })
    .then(function(newItems) {
      return Q.allSettled(
        _.map(newItems, function(item) {
          return Q.ninvoke(item, 'save')
            .fail(function(err) {
              if (err.name === 'ItemNotUniqueError') { 
                var existing = err.existing;
                if (!_.contains(existing.sources, source._id)) {
                  existing.sources.push(source);
                  return Q.ninvoke(existing, 'save');
                } else {
                  return err.existing; 
                }
              } else { throw err; }
            });
        })
      );
    })
    .then(function() {
      if (isPastDeadline) {
        source.lastFetchedAt = Date.now();
        return Q.ninvoke(source, 'save');
      } else { return true; }
    })
    .then(function() {
      return Q.ninvoke(Item, 'find', { 
        sources: source,
        createdAt: { $gt: since }
      });
    });
  };

  schema.methods.scrape = function() {
    var source = this,
        deferred = Q.defer(),
        child = exec([
          config.RSSLY_EXECUTABLE,
          'fetch',
          "'" + this.url + "'",
          '--format=json',
          '--verbose=true',
          '--summary-ratio=' + config.RSSLY_SUMMARY_RATIO
        ].join(' '),
        function(err, stdout, stderr) {
          if (err) { return deferred.reject(err); }
          deferred.resolve(_.map(JSON.parse(stdout), function(raw) {
            return new Item({
              sources: [source],
              url: raw.url,
              title: raw.title,
              summary: raw.summary,
              topics: raw.topics,
              publishedAt: raw.published
            });
          }));
        });

    child.stderr.on('data', function(data) {
      console.info(data);
    });

    return deferred.promise;
  };

  return schema;

})());
