/**
 * Created by basti on 25.01.16.
 */
var api_key = process.env.MAILGUN_APIKEY || null;
var mailDomain = process.env.MAILGUN_DOMAIN || null;

if (!api_key || !mailDomain) {
  console.error("no mail env vars");
  process.exit(1);
}

var mailgun = require('mailgun-js')({apiKey: api_key, domain: mailDomain});
var DOMAIN = process.env.DOMAIN || "<Domain>";
var FROM = process.env.FROM || "<sebastian@bejga.de>";
var SINCERELY = process.env.SINCERELY ||"Your Rotebuehl User Management";

var activationMail = function (user, callback) {
  //noinspection HtmlUnknownTarget
  var data = {
    from: FROM,
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
    SINCERELY
  };

  //send and callback with err, body
  mailgun.messages().send(data, function (err, response) {
    console.log("mailgun send", response);
    callback(err, response);
  });
};

var passwordMail = function (user, password, callback) {
  //noinspection HtmlUnknownTarget
  var data = {
    from: FROM,
    to: user.email,
    subject: 'Your Password Reset',
    html: 'Hello, ' + user.name + '<br/>' +
    '<br/>' +
      //TODO: insert URL/Name of Service
    'You have requested a new password at '+DOMAIN+'. And here it is <br/>' +
    '<br/>' +
    password + '<br/>' +
    '<br/>' +
    'Best regards,' +
    SINCERELY
  };

  //send and callback with err, body
  mailgun.messages().send(data, function (err, response) {
    console.log("mailgun send", response);
    callback(err, response);
  });
};

module.exports = {
  activationMail: activationMail,
  passwordMail: passwordMail
};
