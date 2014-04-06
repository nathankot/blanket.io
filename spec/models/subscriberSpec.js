/* global describe, it, before, beforeEach, afterEach */
/* jshint expr: true */

'use strict';

var helper = require('../helper.js'),
    connection = require('../../db.js'),
    Subscriber = require('../../models/subscriber.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Q = require('q');

describe('Model: Subscriber', function() {
  
  var subscriber, sources;

  beforeEach(function(done) {
    helper.fakeSources()
    .then(function(s) { sources = s; done(); })
    .done();
  });

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

});
