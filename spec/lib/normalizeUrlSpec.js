var normalizeUrl = require('../../lib/normalizeUrl.js'),
    expect = require('chai').expect,
    _ = require('lodash');

describe('Lib: normalizeUrl', function() {
  _.each({
    'news.ycombinator.com': 'http://news.ycombinator.com',
    'https://news.ycombinator.com/': 'https://news.ycombinator.com',
    'nzherald.com/blog/rss/?query=123': 'http://nzherald.com/blog/rss?query=123',
    'http://arstechnica.com/?superman&rules': 'http://arstechnica.com',
    'news.ycombinator.com/': 'http://news.ycombinator.com',
    '//news.ycombinator.com/': 'http://news.ycombinator.com'
  }, function(expected, test) {
    it('should normalize ' + test + ' to ' + expected, function() {
      expect(normalizeUrl(test)).to.equal(expected);
    });
  });
});
