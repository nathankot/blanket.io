/* global describe, it, before, beforeEach, afterEach */
/* jshint expr: true */

'use strict';

var helper = require('../helper.js'),
    connection = require('../../db.js'),
    Source = require('../../models/source.js'),
    Item = require('../../models/item.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Q = require('q'),
    sinon = require('sinon');

describe('Model: Source', function() {

  var source;

  describe('instantiation', function() {

    before(function() { nock.disableNetConnect(); });
    beforeEach(function() { helper.setupHNNocks(); });
    beforeEach(function(done) { Source.collection.remove(done); });

    beforeEach(function(done) {
      source = new Source({ url: 'news.ycombinator.com/' });
      source.save(function(err, s) {
        if (err) { console.log(err); }
        source = s;
        done();
      });
    });

    it('should verify the url and update any redirects', function() {
      expect(source.url).to.equal('https://news.ycombinator.com/');
    });

    it('should assign a title if none given', function() {
      expect(source.title).to.equal('Hacker News');
    });

    it('should assign created at', function() {
      expect(source.createdAt).not.to.be.null;
    });

    it('should assign a last fetched at as null', function() {
      expect(source.lastFetchedAt).to.equal(null);
    });

    it('assigns an fetch frequency and defaults to 6 hours', function() {
      expect(source.fetchFrequency).to.equal('6 hours');
    });

    describe('duplicate source', function() {

      it('should err upon save', function(done) {
        helper.setupHNNocks();
        var dup = new Source({ url: 'news.ycombinator.com/' });
        dup.save(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
      
    });

  });

  describe('source.fetch()', function() {

    var source, fetched, itemsCount, fetchedAt;

    before(function() { 
      nock.disableNetConnect(); 
      helper.setupHNNocks(); 
    });

    before(function(done) { 
      Source.collection.remove(function() {
        Item.collection.remove(done);
      }); 
    });

    before(function(done) {
      new Source({ url: 'news.ycombinator.com/' }).save(function(err, s) {
        if (err) { console.log(err); }
        source = s;
        done();
      });
    });

    before(function() {
      var spy = sinon.stub(source, 'scrape', function() {
        return helper.fakeItems(source);
      });
    });

    before(function() {
      fetched = source.fetch().then(function(items) {
        fetchedAt = source.lastFetchedAt;
        itemsCount = items.length;
        return items;
      })
      .fail(function(err) {
        console.error(err);
      });
    });
    
    it('returns a promise for saved items', function(done) {
      fetched.then(function(items) {
        expect(_.first(items)).to.be.an.instanceOf(Item);
        expect(_.first(items).isNew).to.equal(false);
        done();
      })
      .done();
    });

    it('sets the last fetched at', function() {
      expect(source.lastFetchedAt).not.to.be.null;
    });

    it('does not do another update upon second fetch', function(done) {
      source.fetch().then(function() {
        expect(source.lastFetchedAt).to.equal(fetchedAt);
        done();
      })
      .done();
    });

    it('returns the same count of items', function(done) {
      source.fetch().then(function(items) {
        expect(items.length).to.equal(itemsCount);
        done();
      });
    });
  });

  // This test takes a long time to run.
  describe('source.scrape()', function() {
    this.pending = !process.env.TEST_ALL;
    this.timeout(120000);

    var results, source;

    before(function(done) {
      nock.disableNetConnect(); 
      helper.setupHNNocks(); 
      Source.collection.remove(function() {
        new Source({ url: 'news.ycombinator.com/' })
        .save(function(err, s) {
          if (err) { console.log(err); }
          source = s;
          source.scrape().then(function(items) {
            results = items;
            done();
          });
        });
      }); 
    });

    it('returns a promise for items', function() {
      expect(_.first(results)).to.be.an.instanceOf(Item);
    });

    it('sets the source', function() {
      expect(_.first(results).sources[0].toString()).to.equal(source._id.toString());
    });
  });
});
