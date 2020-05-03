'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let notification = require('../../controllers/server/notification')

router.use(function (req, res, next) {
  // console.log('notification: ' + Date.now());
  res.locals.Path = 'notification';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});


router.route('/sent').get(action.checkAction('NOTIFICATION_INDEX'), notification.sent);
router.route('/received').get(action.checkAction('NOTIFICATION_INDEX'), notification.received);

router.route('/add').all(action.checkAction('NOTIFICATION_CREATE'), notification.add);

router.route('/:id').get(action.checkAction('NOTIFICATION_DETAIL'), notification.one);

router.route('/:id/del').post(action.checkAction('NOTIFICATION_DELETE'), notification.del);

router.route('/').get(action.checkAction('NOTIFICATION_INDEX'), notification.list);

module.exports = function (app) {
  let path = util.translateAdminDir('/notification');
  app.use(path, router);
};
