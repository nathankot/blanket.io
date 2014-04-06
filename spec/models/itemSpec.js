/* jshint expr: true */

require('../../db.js');
var Item = require('../../models/item.js'),
    expect = require('chai').expect;

describe('Model: Item', function() {

  var item;

  beforeEach(function(done) { Item.collection.remove(done); });

  beforeEach(function(done) {
    new Item({
      url: 'http://nzherald.co.nz/nz/news/article.cfm/?c_id=1&objectid=11233247',
      title: 'A man-made noice',
      topics: ['flight', 'plane', 'malaysian'],
      publishedAt: '2014-04-06 12:21:57 +1200',
      summary: 'A signal that is "consistent with an aircraft black box" ' +
               'is now the focus of the search for the missing Flight MH370, '+
               'but authorities are warning there is no confirmed link.'
    }).save(function(err, i) {
      if (err) { console.log(err); }
      item = i;
      done();
    });
  });

  it('should set occurences to 1 for new item', function() {
    expect(item.occurrences).to.equal(1);
  });

  it('should normalize the url', function() {
    expect(item.url).to.equal('http://nzherald.co.nz/nz/news/article.cfm?c_id=1&objectid=11233247');
  });

  describe('duplicate item', function() {

    it('should err upon save', function(done) {
      new Item({
        url: 'http://nzherald.co.nz/nz/news/article.cfm/?c_id=1&objectid=11233247'
      }).save(function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

  });

  describe('item.toJSON()', function() {
    var subject;
    beforeEach(function() {
      subject = item.toJSON();
    });

    it('should have url', function() {
      expect(subject.url).not.to.be.an.undefined;
    });

    it('should have title', function() {
      expect(subject.title).not.to.be.an.undefined;
    });

    it('should have summary', function() {
      expect(subject.summary).not.to.be.an.undefined;
    });

    it('should have an array of topics', function() {
      expect(subject.topics).to.be.an.array;
    });
  });

});
