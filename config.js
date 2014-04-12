'use strict';

var config = {
  MONGO_URL: (function() {
    return process.env.MONGO_URL ||
      process.env.MONGOHQ_URL ||
      process.env.NODE_ENV === 'testing' ? 
      'mongodb://localhost/blanket-test' :
      'mongodb://localhost/blanket';
  })(),

  RSSLY_EXECUTABLE: 'bundle exec rssly',
  RSSLY_SUMMARY_RATIO: '5',

  NODEMAILER_TRANSPORT: 'SMTP',
  NODEMAILER_TRANSPORT_OPTIONS: {
    host: 'localhost',
    port: '1025'
  },

  EMAIL_FROM: 'digest@blanket.io',
  EMAIL_DIGEST_SUBJECT: 'Your blanket.io digest',

  DIGESTER_INTERVAL: (function() {
    if (process.env.NODE_ENV === 'development') { return '1 minute'; }
    else { return '1 day'; }
  })()
};

module.exports = config;
