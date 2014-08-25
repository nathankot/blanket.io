/* global describe, it, before, beforeEach, afterEach */
/* jshint expr: true */

'use strict';

var helper = require('../helper.js'),
    connection = require('../../db.js'),
    Subscriber = require('../../models/subscriber.js'),
    Item = require('../../models/item.js'),
    Source = require('../../models/source.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Q = require('q'),
    sinon = require('sinon');

describe('Model: Subscriber', function() {

  var subscriber, sources, items;

  beforeEach(function(done) { Source.collection.remove(done); });
  beforeEach(function(done) { Item.collection.remove(done); });
  beforeEach(function(done) { Subscriber.collection.remove(done); });

  beforeEach(function(done) {
    new Subscriber({
      email: 'me@nathankot.com',
      deliveryFrequency: '1 day',
      sources: _.map(sources, function(s) { return s.toJSON(); })
    }).save(function(err, s) {
      if (err) { console.log(err); }
      subscriber = s;
      done();
    });
  });

  beforeEach(function(done) {
    helper.fakeSources()
    .then(function(s) {
      sources = s;
      subscriber.sources = sources;
      return Q.ninvoke(subscriber, 'save');
    })
    .then(function() { done(); })
    .done();
  });

  beforeEach(function(done) {
    Q.allSettled(_.each(sources, function(source) {
      return Q.ninvoke(source, 'save');
    }))
    .then(function() { done(); })
    .done();
  });

  beforeEach(function(done) {
    helper.fakeItems()
    .then(function(items) {
      return Q.allSettled(
        _.map(items, function(i) { return Q.ninvoke(i, 'save'); })
      );
    })
    .then(function(results) {
      return _.map(results, function(r) { return r.value[0]; });
    })
    .then(function(i) {
      items = i;
      done();
    });
  });

  beforeEach(function() {
    (function createSpy() {
      var spy = sinon.stub(subscriber, 'populate', function(__, cb) {
        spy.restore();
        return Q.ninvoke(subscriber, 'populate', 'sources')
        .then(function(subscriber) {
          _.forEach(subscriber.sources, function(source) {
            sinon.stub(source, 'scrape', function() {
              return Q.allSettled(
                _.map(items, function(item) {
                  if (!_.contains(item.sources, source)) {
                    item.sources.push(source._id);
                    return Q.ninvoke(item, 'save');
                  } else {
                    return item;
                  }
                })
              )
              .then(function(results) {
                return _.map(results, function(r) { return r.value; });
              });
            });
          });

          return subscriber;
        })
        .then(function(subscriber) {
          createSpy();
          cb(null, subscriber);
        });
      });
    })();
  });

  it('has an email', function() {
    expect(subscriber.email).to.equal('me@nathankot.com');
  });

  it('has an array of source _ids', function() {
    expect(subscriber.sources).to.be.an.instanceOf(Array);
  });

  it('has a frequency', function() {
    expect(subscriber.deliveryFrequency).not.to.be.null;
  });

  describe('subscriber.toJSON()', function() {
    var json;

    beforeEach(function() { json = subscriber.toJSON(); });

    it('should not expose the active until', function() {
      expect(json.activeUntil).to.be.undefined;
    });
  });

  describe('getDigest', function() {

    it('should return a promise', function() {
      expect(subscriber.getDigest()).to.respondTo('then');
    });

    it('should resolve a list of items', function(done) {
      subscriber.getDigest()
      .then(function (items) {
        // console.log(items);
        expect(items).to.be.an.instanceOf(Array);
        expect(_.first(items)).to.be.an.instanceOf(Item);
        done();
      })
      .done();
    });

    it('should consider all sources', function(done) {
      subscriber.getDigest()
      .then(function (i) {
        expect(i.length).to.equal(items.length * subscriber.sources.length);
        done();
      })
      .done();
    });

    it('should repeatedly resolve the same list of items', function(done) {
      var firstCount, secondCount;
      subscriber.getDigest()
      .then(function (items) {
        firstCount = items.length;
        return subscriber.getDigest();
      })
      .then(function (items) {
        secondCount = items.length;
        expect(firstCount).to.equal(secondCount);
        done();
      })
      .done();
    });

  });

});
