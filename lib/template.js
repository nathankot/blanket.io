var emailTemplates = require('email-templates'),
    path = require('path'),
    templatesDir = path.join(__dirname, '..', 'templates'),
    Q = require('q'),
    url = require('url'),
    // Pick up handlebars from the email-templates module
    handlebars = require('../node_modules/email-templates/node_modules/handlebars');

// Setup handlebars plugins
handlebars.registerHelper('link', function(options) {
  var parsed = url.parse(options.fn(this));
  return '<a href="' + options.fn(this) + '">' + 
       parsed.hostname + 
    '</a>';
});

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
