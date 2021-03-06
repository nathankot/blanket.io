'use strict';

var Source = require('../models/source.js'),
    HttpError = require('../lib/httpError.js'),
    _ = require('lodash'),
    Q = require('q');

/**
 * Create one, or multiple sources.
 */
exports.create = function(req, res, next) {
  var isMultiple = false;

  Q.fcall(function normalizeRequest() {
    if (_.isArray(req.body)) {
      isMultiple = true;
      return _.map(req.body, function(raw) {
        return new Source({ url: raw.url });
      });
    } else {
      return [new Source({ url: req.body.url })];
    }
  })
  .then(function createSources(sources) {
    return Q.allSettled(_.map(sources, function(source) {
      return Q.ninvoke(source, 'save');
    }));
  })
  .then(function filterSources(results) {
    return Q.all(
      _(results).filter(function(result) {
        if (result.state === 'fulfilled') { return true; }
        else if (result.reason.existing) { return true; }
        else { return false; }
      }).map(function(result) {
        if (result.state === 'fulfilled') {
          return _.first(result.value);
        } else {
          return result.reason.existing;
        }
      }).value()
    );
  })
  .then(function respond(sources) {
    if (sources.length <= 0) {
      throw new HttpError('No reachable sources found', 422);
    }

    if (isMultiple) {
      res.send(201, _.map(sources, function(source) {
        return source.toJSON();
      }));
    } else {
      res.send(201, _.first(sources).toJSON());
    }
  })
  .fail(function(err) { next(err); });
};
