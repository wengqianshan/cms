'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let log = require('../../controllers/server/log')

router.use(function (req, res, next) {
  // console.log('log: ' + Date.now());
  res.locals.Path = 'log';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/:id').get(action.checkAction('LOG_DETAIL'), log.one);

router.route('/:id/del').post(action.checkAction('LOG_DELETE'), log.del);

router.route('/').get(action.checkAction('LOG_INDEX'), log.list);

module.exports = function (app) {
  let path = util.translateAdminDir('/log');
  app.use(path, router);
};
