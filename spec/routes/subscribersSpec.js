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

  describe('create', function() {
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

    it('should populate user sources', function(done) {
      cb = function(code, user) {
        expect(user.sources[0].url).not.to.be.undefined;
        done();
      };

      subscribers.create(req, res, function(err) {
        console.log(err);
      });
    });
  });

  describe('destroy', function() {
    it('should remove the user', function(done) {
      var subscriber = new Subscriber({
        email: 'me@nathankot.com',
        sources: sources
      }).save(function(s) {
        cb = function() {
          Subscriber.find({ email: 'me@nathankot.com' }, function(err, subscribers) {
            expect(subscribers.length).to.equal(0);
          });

          done();
        };

        req.params = { email: 'me@nathankot.com' };
        subscribers.destroy(req, res, cb);
      });
    });
  });

});
