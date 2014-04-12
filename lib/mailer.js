var mailer = require('nodemailer'),
    config = require('../config.js');

module.exports = (function() {
  return mailer.createTransport(
    config.NODEMAILER_TRANSPORT,
    config.NODEMAILER_TRANSPORT_OPTIONS
  );
})();

