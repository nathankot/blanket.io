var emailTemplates = require('email-templates'),
    path = require('path'),
    templatesDir = path.join(__dirname, '..', 'templates'),
    Q = require('q'),
    url = require('url');

// Setup handlebars plugins
(function setupHandlebarsHelpers() {

  // Pick up handlebars from the email-templates module
  var handlebars = require('../node_modules/email-templates/node_modules/handlebars'),
      sugar = require('sugar');

  handlebars.registerHelper('link', function(options) {
    var parsed = url.parse(options.fn(this));
    return '<a href="' + options.fn(this) + '">' + 
        parsed.hostname + 
      '</a>';
  });

  handlebars.registerHelper('date', function() {
    return Date.create().format('short');
  });

  handlebars.registerHelper('ellipsis', function (str, limit, append) {
    if (typeof append !== 'string') { append = ''; }
    limit = parseInt(limit, 10);
    var sanitized = handlebars.Utils.escapeExpression(str);
    if (sanitized.length > limit) {
      return new handlebars.SafeString(sanitized.substr(0, limit - append.length) + append);
    } else {
      return sanitized;
    }
  });

})();

/**
 * Get the renderer for a given template name.
 *
 * @param templateName
 * @returns
 */
module.exports = function(templateName, locals) {
  return Q.nfcall(emailTemplates, templatesDir)
  .then(function(template) {
    return Q.nfcall(template, templateName, locals);
  })
  .spread(function(html, text) {
    return { html: html, text: text };
  });
};
