var Agenda = require('agenda'),
    config = require('../config.js');

module.exports = new Agenda({
  db: { address: config.MONGO_URL }
});
