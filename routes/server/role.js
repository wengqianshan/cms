'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let role = require('../../controllers/server/role')

router.use(function (req, res, next) {
  // console.log('role: ' + Date.now());
  res.locals.Path = 'role';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('ROLE_INDEX'), role.list);

router.route('/add').all(action.checkAction('ROLE_CREATE'), role.add);

router.route('/:id').get(action.checkAction('ROLE_DETAIL'), role.one);

router.route('/:id/edit').all(action.checkAction('ROLE_UPDATE'), role.edit);

router.route('/:id/del').post(action.checkAction('ROLE_DELETE'), role.del);


module.exports = function (app) {
  let path = util.translateAdminDir('/role');
  app.use(path, router);
};
