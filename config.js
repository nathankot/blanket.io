'use strict';

var config = {
  MONGO_URL: (function() {
    return process.env.MONGO_URL ||
      process.env.MONGOHQ_URL ||
      process.env.NODE_ENV === 'testing' ? 
      'mongodb://localhost/rss-test' :
      'mongodb://localhost/rss';
  })(),

  RSSLY_EXECUTABLE: 'bundle exec rssly',
  RSSLY_SUMMARY_RATIO: '15',

  NODEMAILER_TRANSPORT: 'SMTP',
  NODEMAILER_TRANSPORT_OPTIONS: {},

  EMAIL_FROM: 'digest@blanket.io',
  EMAIL_DIGEST_SUBJECT: 'Your blanket.io digest'
};

module.exports = config;
