'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let user = require('../../controllers/server/user')

router.use(function (req, res, next) {
  // console.log('user: ' + Date.now());
  res.locals.Path = 'user';
  next();
});

router.route('/login').all(user.checkInstall, user.login);

router.route('/register').all(user.register);

router.route('/query').all(user.authenticate, user.query);

router.route('/logout').all(user.logout);

router.route('/forget').all(user.forget);

router.use(function (req, res, next) {
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('USER_INDEX'), user.list);

router.route('/add').all(action.checkAction('USER_CREATE'), user.add);

router.route('/:id').get(action.checkAction('USER_DETAIL'), user.one);

router.route('/:id/edit').all(action.checkAction('USER_UPDATE'), user.edit);

router.route('/:id/del').post(action.checkAction('USER_DELETE'), user.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/user');
  app.use(path, router);
};
