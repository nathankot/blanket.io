var agenda = require('../lib/agenda.js'),
    config = require('../config.js'),
    Subscriber = require('../models/subscriber.js'),
    sugar = require('sugar'),
    Q = require('q'),
    _ = require('lodash');

agenda.define('digest', function(job, done) {
  console.info('Sending digests...');

  var minDeliveredAt = Date.create().rewind(config.DIGESTER_INTERVAL),
        query = Subscriber.find()
        .where({ activeUntil: { $gt: Date.now() } })
        .or([
          { lastDeliveryAt: { $lt: minDeliveredAt } },
          { lastDeliveryAt: null }
        ])
        .limit(1);

  Q.ninvoke(query, 'exec')
  .then(function(subs) {
    return Q.allSettled(
      _.map(subs, function(s) {
        var next = Date.create(s.lastDeliveryAt).advance(s.deliveryFrequency);
        if (!s.lastDeliveryAt || next <= Date.create()) {
          console.info('Sending digest to: ' + s.email);
          return s.sendDigest();
        } else {
          return s;
        }
      })
    );
  })
  .then(function() {
    console.info('Digests all sent.');
    done();
  })
  .fail(function(err) {
    console.error(err);
    done();
  });
});
