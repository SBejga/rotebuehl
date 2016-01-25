/**
 * Created by basti on 25.01.16.
 */
var api_key = process.env.MAILGUN_APIKEY || null;
var mailDomain = 'stranged.de';

var mailgun = require('mailgun-js')({apiKey: api_key, domain: mailDomain});

var DOMAIN = process.env.DOMAIN || "<Domain>";

var activationMail = function (user, callback) {

  //noinspection HtmlUnknownTarget
  var data = {
    from: '<bejga@lehre.dhbw-stuttgart.de>',
    to: user.email,
    subject: 'Your Registration',
    html: 'Hello, ' + user.name + '<br/>' +
          '<br/>' +
          //TODO: insert URL/Name of Service
          'You have registered at '+DOMAIN+'. I think you know what todo next. <br/>' +
    '<br/>' +
    '<a href="'+DOMAIN+'/api/users/activate/' + user.activationToken + '">Activate Account</a><br/>' +
    '<br/>' +
    'Best regards,' +
    'Your Gatekeeper'
  };

  //send and callback with err, body
  mailgun.messages().send(data, callback);
};

module.exports = {
  activationMail: activationMail
};
