/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  /* Get version info and git info (via drone env) of API */
  app.get('/version', function (req, res) {
    var commit;
    try {
      commit = require('../git.json');
    } catch (e) {
      console.log("file ../git.json not found", e);
    }
    var pkg = require('../package.json');

    if (!commit) {
      commit = {git: false};
    }

    commit.version = pkg.version;

    res.send(commit);
  });

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
