'use strict';

var User = require('./user.model');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var mailController = require('../../components/mail/mail.controller');
var crypto = require('crypto');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

var generateRandomPassword = function () {
  return crypto.randomBytes(10).toString('hex');
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword -activationToken', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 5*60*60 }); //in Seconds

    //send activation Mail
    mailController.activationMail(user, function (err /*, body*/) {
      if (err) return next(err);

      res.json({ token: token });
    });

  });
};

/**
 * Activate a new registered user by sending activation mail with activationToken
 */
exports.activate = function (req, res, next) {
  var activationToken = req.params.activationToken;
  var query = {activationToken: activationToken};

  //if user context (auth required) add to query
  if (req.user) {
    query._id = req.user._id;
  }

  User.findOne(query, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send({"err": "Unauthorized"});

    //activate user status
    var status = user.activate();

    //switch between result true/false (false: maybe alread avtivated?)
    if (status) {
      res.json({profile: user.profile, result: true, msg: "activated"});
    } else {
      res.json({profile: user.profile, result: false, msg: "was already activated"});
    }
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err /*, user*/) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res /*, next*/) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Create new password
 * @param req
 * @param res
 */
exports.createPassword = function(req, res /*, next*/) {
  var email = String(req.body.email);

  User.findOne({
    email: email
  }, function (err, user) {
    if(user && user.email === email) {
      var genPassword = generateRandomPassword();
      user.password = genPassword;
      user.save(function(err) {
        if (err) return validationError(res, err);

        //send mail with new password
        mailController.passwordMail(user, genPassword, function (err /*, body*/) {
          if (err) return next(err);

          res.status(200).send('OK');
        });
      });
    } else {
      res.status(404).send('Not Found');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword -activationToken', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res /*, next*/) {
  res.redirect('/');
};
