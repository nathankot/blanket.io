'use strict';

var mongoose = require('mongoose'),
    sugar = require('sugar'),
    config = require('../config.js'),
    Q = require('q'),
    _ = require('lodash'),
    template = require('../lib/template.js'),
    transport = require('../lib/mailer.js'),
    uniqueValidator = require('mongoose-unique-validator');

module.exports = mongoose.model('Subscriber', (function() {

  var schema = mongoose.Schema({
    email: { type: mongoose.Schema.Types.Email, unique: true, required: true },
    sources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Source' }],
    deliveryFrequency: { type: String, required: true, default: '1 day' },
    lastDeliveryAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    activeUntil: { type: Date, required: true }
  });

  // Give users 3 months activation
  schema.pre('validate', function(next) {
    this.activeUntil = Date.create('3 months from now');
    next();
  });

  schema.options.toJSON = {
    transform: function(doc, ret, options) {
      delete ret.activeUntil;
      return ret;
    }
  };

  /**
   * @return Promise for an array of items
   */
  schema.methods.getDigest = function() {
    var subscriber = this;

    return Q.ninvoke(this, 'populate', 'sources')
    .then(function (subscriber) {
      return Q.allSettled(
        _.map(subscriber.sources, function(source) {
          return source.fetch(subscriber.lastDeliveryAt);
        })
      );
    })
    .then(function(results) {
      var items = [];
      _(results).select(function(result) {
        return result.state === 'fulfilled';
      }).map(function(result) {
        return result.value;
      }).each(function(fetchedItems) {
        items = items.concat(fetchedItems);
      });

      return items;
    });
  };

  schema.methods.sendDigest = function() {
    var subscriber = this;
    return subscriber.getDigest()
    .then(function(items) {
      if (!items.length) {
        throw new Error('No new items.');
      }

      return template('digestv1', {
        items: items,
        subscriber: subscriber
      });
    })
    .then(function(email) {
      return Q.ninvoke(transport, 'sendMail', {
        from: config.EMAIL_FROM,
        to: subscriber.email,
        subject: config.EMAIL_DIGEST_SUBJECT,
        text: email.text,
        html: email.html
      });
    })
    .then(function(response) {
      subscriber.lastDeliveryAt = Date.now();
      subscriber.save();
      return response;
    })
    .fail(function(err) {
      console.info('No new items for ' + subscriber.email);
    });
  };

  schema.plugin(uniqueValidator);

  return schema;

})());
