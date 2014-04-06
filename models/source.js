var mongoose = require('mongoose'),
    request = require('request'),
    normalizeUrl = require('../lib/normalizeUrl.js'),
    SourceNotUniqueError = require('./source/sourceNotUniqueError.js'),
    SourceNotAccessibleError = require('./source/sourceNotAccessibleError.js'),
    Q = require('q'),
    _ = require('lodash'),
    cheerio = require('cheerio'),
    exec = require('child_process').exec,
    config = require('../config.js'),
    Item = require('./item.js');

module.exports = mongoose.model('Source', (function() {

  var schema = mongoose.Schema({
    url: { type: mongoose.Schema.Types.Url, required: true, unique: true },
    title: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  schema.pre('validate', function(next) {
    if (this.isNew) { 
      this.normalize()
      .then(next)
      .fail(function(err) { next(err); });
    } else { next(); }
  });

  /**
   * Check that the source is unique.
   */
  schema.path('url').validate(function(url, respond) {
    Q.ninvoke(mongoose.model('Source'), 'find', { url: url })
    .then(function(sources) { return respond(sources.length === 0); })
    .done();
  }, 'Source url is not unique.');

  /**
   * Normalizes the source url, stores the title if one is found.
   * 
   * @throws SourceNotAccessibleError
   */
  schema.methods.normalize = function() {
    var deferred = Q.defer(),
        that = this;

    this.url = normalizeUrl(this.url);

    request(this.url, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        // Store the resolved uri
        that.url = response.request.uri.href;
        // Store the title if one is found
        var $ = cheerio.load(body), title = $('title').text();
        if (_.isEmpty(that.title) && !_.isEmpty(title)) { that.title = title; }

        deferred.resolve();
      } else {
        deferred.reject(new SourceNotAccessibleError());
      }
    });

    return deferred.promise;
  };

  schema.methods.fetch = function() {
    var deferred = Q.defer(),
        child = exec([
          config.RSSLY_EXECUTABLE,
          'fetch',
          "'" + this.url + "'",
          '--format=json',
          '--verbose=true',
          '--summary-ratio=' + config.RSSLY_SUMMARY_RATIO
        ].join(' '), 
        function(err, stdout, stderr) {
          if (err) { return deferred.reject(err); }
          deferred.resolve(_.map(JSON.parse(stdout), function(raw) {
            return new Item({
              url: raw.url,
              title: raw.title,
              summary: raw.summary,
              topics: raw.topics,
              publishedAt: raw.published
            });
          }));
        });

    child.stderr.on('data', function(data) {
      console.info(data);
    });

    return deferred.promise;
  };

  return schema;

})());
