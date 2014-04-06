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

  Q.fcall(function() {
    if (_.isArray(req.body)) {
      isMultiple = true;
      return _.map(req.body, function(raw) {
        return new Source({ url: raw.url });
      });
    } else {
      return [new Source({ url: req.body.url })];
    }
  })
  .then(function(sources) {
    return Q.allSettled(_.map(sources, function(source) {
      return Q.ninvoke(source, 'save');
    }));
  })
  .then(function(results) {
    return _(results).filter(function(result) {
      return result.state === 'fulfilled';
    }).map(function(result) {
      return _.first(result.value);
    }).value();
  })
  .then(function(sources) {
    if (sources.length <= 0) {
      throw new HttpError('No reachable sources found', 422);
    }

    if (isMultiple) {
      res.send(200, _.map(sources, function(source) {
        return source.toJSON();
      }));
    } else {
      res.send(200, _.first(sources).toJSON());
    }
  })
  .fail(function(err) { next(err); });
};
