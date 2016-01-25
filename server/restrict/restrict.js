/**
 * Created by basti on 25.01.16.
 */

//API Token in ENV
var API_TOKEN_RESTRICT_CREATE = process.env.API_TOKEN_RESTRICT_CREATE;

module.exports = function (req, res, next) {
  if (!req.body) {
    res.status(422).json({err: "no json body"});
    return;
  }

  //check API Token
  var allowByToken = false;
  if (API_TOKEN_RESTRICT_CREATE) {
    var sentApiToken = req.get('X-Gatekeeper-Api-Token');
    if (sentApiToken !== null &&
        sentApiToken !== "" &&
        sentApiToken === API_TOKEN_RESTRICT_CREATE) {

      allowByToken = true;
      req.allowByToken = true;
    }
  }

  //check by email scope
  var allowByEmailDomain = false;
  if (req.body && req.body.email) {
    var email = req.body.email;

    //allow dhbw email domain
    if (email.indexOf("@lehre.dhbw-stuttgart.de") >= 0 ||
        email.indexOf("@dhbw-stuttgart.de") >= 0) {

      allowByEmailDomain = true;
      req.allowByEmailDomain = true;
      req.allowScope = "dhbw";
    }

    //allow email address from sandbox*.mailgun.org for integration tests
    var intTestMail = (email.indexOf(".dhbw@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org") >= 0);
    if (intTestMail) {

      allowByEmailDomain = true;
      req.allowByEmailDomain = true;
      req.allowScope = "test";
    }
  }

  if (allowByToken || allowByEmailDomain) {
    next();
  } else {
    res.status(403).send({err: "restricted"});
  }
};
