'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var restrict = require('../../restrict/restrict');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
//Restrct creation of users
router.post('/', restrict, controller.create);
//TODO: Decide whether need to login for activation, or just click link
router.get('/activate/:activationToken', /*auth.isAuthenticated(),*/ controller.activate);

module.exports = router;
