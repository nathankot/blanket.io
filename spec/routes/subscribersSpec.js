/* global describe, it, beforeEach */
/* jshint expr: true */

'use strict';

var connection = require('../../db.js'),
    helper = require('../helper.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    subscribers = require('../../routes/subscribers.js'),
    Subscriber = require('../../models/subscriber.js'),
    _ = require('lodash');

describe('Route: subscribers', function() {
  var cb, next;
  var res = helper.fakeResponse(function() { cb.apply(this, arguments); });
  var req = {};

  var sources;

  beforeEach(function(done) { Subscriber.collection.remove(done); });

  beforeEach(function(done) {
    helper.fakeSources()
    .then(function(s) {
      sources = _.map(s, function(s) { return s.toJSON(); });
      done();
    });
  });

  beforeEach(function() {
    req.body = {
      email: 'me@nathankot.com',
      sources: sources
    };
  });

  it('should respond with 201', function(done) {
    cb = function(code, user) {
      expect(code).to.match(/2\d\d/);
      done();
    };

    subscribers.create(req, res, function(err) {
      console.log(err);
    });
  });

  it('should respond with a user', function(done) {
    cb = function(code, user) {
      expect(user.email).to.equal('me@nathankot.com');
      done();
    };

    subscribers.create(req, res, function(err) {
      console.log(err);
    });
  });
});
