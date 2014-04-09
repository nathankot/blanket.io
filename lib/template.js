var emailTemplates = require('email-templates'),
    path = require('path'),
    templatesDir = path.join(__dirname, '..', 'templates');

/**
 * Get the renderer for a given template name.
 *
 * @param templateName
 * @returns
 */
module.exports = function(templateName, locals) {

  return function() {
    return Q.nfcall(emailTemplates, templateName)
    .then(function(template) {
      return Q.ninvoke(template, null, locals);
    })
    .spread(function(html, text) {
      return { html: html, text: text };
    });
  };

};
