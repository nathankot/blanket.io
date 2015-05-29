'use strict';

require('./db.js');
var _ = require('lodash'),
    errorHandler = require('./lib/errorHandler.js');

var agenda = require('./lib/agenda.js'),
    digestJob = require('./jobs/digest.js');

agenda.every('10 minutes', 'digest');
agenda.start();
