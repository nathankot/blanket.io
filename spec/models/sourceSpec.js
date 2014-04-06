/* jshint expr: true */

var helper = require('../helper.js'),
    connection = require('../../db.js'),
    Source = require('../../models/source.js'),
    Item = require('../../models/item.js'),
    nock = require('nock'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Q = require('q');

describe('Model: Source', function() {

  var source;

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

  // This test takes a long time to run.
  describe('source.fetch()', function() {
    this.pending = true;
    it('returns a promise for items', function(done) {
      this.timeout(120000);

      source.fetch()
      .then(function(items) {
        expect(_.first(items)).to.be.an.instanceOf(Item);
        done();
      })
      .done();
    });
  });

});
