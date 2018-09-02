'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let message = require('../../controllers/server/message')

//权限判断
router.use(function (req, res, next) {
  console.log('评论页: ' + Date.now());
  res.locals.Path = 'message';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});
//内容列表
router.route('/').get(action.checkAction('MESSAGE_INDEX'), message.list);
//单条信息
router.route('/:id').get(action.checkAction('MESSAGE_DETAIL'), message.one);
//删除信息
router.route('/:id/del').all(action.checkAction('MESSAGE_DELETE'), message.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/message');
  app.use(path, router);
};
