'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let message = require('../../controllers/server/message')

router.use(function (req, res, next) {
  // console.log('message: ' + Date.now());
  res.locals.Path = 'message';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('MESSAGE_INDEX'), message.list);

router.route('/:id').get(action.checkAction('MESSAGE_DETAIL'), message.one);

router.route('/:id/del').post(action.checkAction('MESSAGE_DELETE'), message.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/message');
  app.use(path, router);
};
