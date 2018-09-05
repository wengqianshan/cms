'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let log = require('../../controllers/server/log')

//权限判断
router.use(function (req, res, next) {
  console.log('通知页: ' + Date.now());
  res.locals.Path = 'log';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

//单条信息
router.route('/:id').get(action.checkAction('LOG_DETAIL'), log.one);
//删除信息
router.route('/:id/del').post(action.checkAction('LOG_DELETE'), log.del);
//内容列表
router.route('/').get(action.checkAction('LOG_INDEX'), log.list);

module.exports = function (app) {
  let path = util.translateAdminDir('/log');
  app.use(path, router);
};
