'use strict';

var mongoose = require('mongoose'),
    moment = require('moment');

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
    this.activeUntil = moment().add('months', 3).toDate();
    next();
  });

  schema.options.toJSON = {
    transform: function(doc, ret, options) {
      delete ret.activeUntil;
      return ret;
    }
  };

  return schema;

})());
