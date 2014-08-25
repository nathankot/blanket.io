var nock = require('nock'),
    _ = require('lodash'),
    Q = require('q'),
    Source = require('../models/source.js'),
    Item = require('../models/item.js'),
    Faker = require('Faker');

exports.setupHNNocks = function() {
  nock('http://news.ycombinator.com')
    .get('/')
    .reply(302, undefined, {
      Location: 'https://news.ycombinator.com'
    });

  nock('https://news.ycombinator.com')
    .get('/')
    .replyWithFile(200, __dirname + '/fixtures/hn.html')
    .get('/rss')
    .replyWithFile(200, __dirname + '/fixtures/hn_rss.xml');

  nock('http://www.sitepoint.com')
    .get('/')
    .replyWithFile(200, __dirname + '/fixtures/hn.html')
    .get('/rss')
    .replyWithFile(200, __dirname + '/fixtures/sitepoint_rss.xml')
    .get('/opal-ruby-browser-basics')
    .replyWithFile(200, __dirname + '/fixtures/hn/opal.html');

  nock('http://chrismorgan.info')
    .get('/blog/say-no-to-import-side-effects-in-python.html')
    .replyWithFile(200, __dirname + '/fixtures/hn/import_side_effects.html');

  nock('http://www.dragtimes.com')
    .get('/blog/tesla-model-s-ethernet-network-explored-possible-jailbreak-in-the-future')
    .replyWithFile(200, __dirname + '/fixtures/hn/tesla.html');
};

exports.fakeResponse = function(cb) {
  return {
    send: function() {
      if (typeof cb === 'function') { cb.apply(this, arguments); }
    }
  };
};

/**
 * @returns Promise
 */
exports.fakeSources = function() {
  exports.setupHNNocks();

  return Q.ninvoke(Source.collection, 'remove')
    .then(function() {
      return Q.all([
        Q.ninvoke(new Source({ url: 'http://news.ycombinator.com' }), 'save'),
        Q.ninvoke(new Source({ url: 'https://news.ycombinator.com/rss' }), 'save'),
        Q.ninvoke(new Source({ url: 'http://www.sitepoint.com' }), 'save')
      ]);
    })
    .then(function(sources) {
      return _.map(sources, function(a) {
        return _.first(a);
      });
    });
};

/**
 * @returns Promise
 */
exports.fakeItems = function(source) {
  return Q.fcall(function() {
    return [
      new Item({
        url: 'http://www.sitepoint.com/opal-ruby-browser-basics/',
        sources: source ? [source] : [],
        title: Faker.Lorem.sentence(),
        summary: Faker.Lorem.paragraph(Math.floor((Math.random()*100)+1))
      }),
      new Item({
        url: 'http://chrismorgan.info/blog/say-no-to-import-side-effects-in-python.html',
        sources: source ? [source] : [],
        title: Faker.Lorem.sentence(),
        summary: Faker.Lorem.paragraph(Math.floor((Math.random()*100)+1))
      }),
      new Item({
        url: 'http://www.dragtimes.com/blog/tesla-model-s-ethernet-network-explored-possible-jailbreak-in-the-future',
        sources: source ? [source] : [],
        title: Faker.Lorem.sentence(),
        summary: Faker.Lorem.paragraph(Math.floor((Math.random()*100)+1))
      })
    ];
  });
};
