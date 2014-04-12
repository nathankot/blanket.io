var emailTemplates = require('email-templates'),
    path = require('path'),
    templatesDir = path.join(__dirname, '..', 'templates'),
    Q = require('q');

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
