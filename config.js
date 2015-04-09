'use strict';

var config = {
  MONGO_URL: (function() {
    if (process.env.NODE_ENV === 'production') {
      return process.env.MONGOHQ_URL;
    } else {
      return process.env.MONGO_URL ||
        process.env.NODE_ENV === 'testing' ?
        'mongodb://localhost/blanket-test' :
        'mongodb://localhost/blanket';
    }
  })(),

  RSSLY_EXECUTABLE: 'bundle exec rssly',
  RSSLY_SUMMARY_RATIO: '5',

  NODEMAILER_TRANSPORT: 'SMTP',
  NODEMAILER_TRANSPORT_OPTIONS: {
    host: 'localhost',
    port: '1025'
  },

  EMAIL_FROM: 'digest@getblanket.com',
  EMAIL_DIGEST_SUBJECT: 'Your Blanket Digest',

  DIGESTER_INTERVAL: (function() {
    if (process.env.NODE_ENV === 'development') { return '1 minute'; }
    else { return '1 day'; }
  })()
};

if (process.env.NODE_ENV === 'production') {
  config.NODEMAILER_TRANSPORT_OPTIONS = {
    service: 'mandrill',
    auth: {
      user: process.env.MANDRILL_USERNAME,
      pass: process.env.MANDRILL_APIKEY
    }
  };
}

module.exports = config;
