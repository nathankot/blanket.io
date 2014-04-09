var mailer = require('nodemailer'),
    config = require('../config.js');


module.exports = (function() {
  return mailer.createTrasnport(
    config.NODEMAILER_TRANSPORT,
    config.NODEMAILER_TRANSPORT_OPTIONS
  );
})();

