'use strict';

var Subscriber = require('../models/subscriber.js'),
    HttpError = require('../lib/httpError.js'),
    _ = require('lodash'),
    Q = require('q');

/**
 * Creates a subscriber.
 */
exports.create = function(req, res, next) {
  Q.ninvoke(
    new Subscriber({
      email: req.body.email,
      sources: _.map(req.body.sources, function(s) { return s._id; })
    }),
    'save'
  ).spread(function(subscriber) {
    return Q.ninvoke(subscriber, 'populate', 'sources');
  }).then(function(subscriber) {
    res.send(201, subscriber.toJSON());
  })
  .fail(function(err) { next(err); });
};
