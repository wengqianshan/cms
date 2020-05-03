'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let me = require('../../controllers/server/me')

router.use(function (req, res, next) {
  // console.log('me: ' + Date.now());
  res.locals.Path = 'me';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});
router.get('/', me.init);
router.route('/edit').all(me.edit);
router.route('/updatepwd').all(me.updatePassword);

module.exports = function (app) {
  let path = util.translateAdminDir('/me');
  app.use(path, router);
};
