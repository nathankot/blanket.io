/* global describe, it, beforeEach */
/* jshint expr: true */

'use strict';

var connection = require('../../db.js'),
    helper = require('../helper.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    sources = require('../../routes/sources.js'),
    Source = require('../../models/source.js'),
    _ = require('lodash');

describe('Route: sources', function() {

  var cb, next;
  var res = helper.fakeResponse(function() { cb.apply(this, arguments); });
  var req = {};

  beforeEach(function() { nock.disableNetConnect(); });
  beforeEach(function() { helper.setupHNNocks(); });
  beforeEach(function(done) { Source.collection.remove(done); });

  describe('sources.create()', function() {

    describe('multi create', function() {

      beforeEach(function() {
        nock('http://nzherald.co.nz').get('/').reply(404);
        req.body = [{ url: 'https://news.ycombinator.com' },
                    { url: 'https://news.ycombinator.com/rss' },
                    { url: 'http://nzherald.co.nz' }];
      });

      it('should respond with an array', function(done) {
        cb = function(code, sources) {
          expect(code).to.match(/2\d\d/);
          expect(sources).to.be.an.instanceOf(Array);
          expect(_.first(sources)._id).not.to.be.an.undefined;
          expect(_.first(sources).url).not.to.be.an.undefined;
          expect(_.first(sources).title).not.to.be.an.undefined;
          done();
        };

        sources.create(req, res, next);
      });

      it('should filter out the unreachable source', function(done) {
        cb = function(code, sources) {
          expect(sources.length).to.equal(2);
          done();
        };

        sources.create(req, res, next);
      });

    });

    describe('single create', function() {

      beforeEach(function() {
        req.body = { url: 'https://news.ycombinator.com' };
      });

      it('should respond with a single source', function(done) {
        next = cb = function(code, source) {
          expect(code).to.match(/2\d\d/);
          expect(source._id).not.to.be.an.undefined;
          expect(source.url).not.to.be.an.undefined;
          expect(source.title).not.to.be.an.undefined;
          done();
        };

        sources.create(req, res, next);
      });

      describe('source not found', function() {

        beforeEach(function() {
          req.body = { url: 'http://dev.null' };
          nock('http://dev.null').get('/').reply(404);
        });

        it('should throw a http error', function(done) {
          next = function(err) {
            expect(err).to.be.an.instanceOf(Error);
            expect(err.status).to.match(/4\d\d/);
            done();
          };

          sources.create(req, res, next);
        });
        
      });

    });

  });

});
