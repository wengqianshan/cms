'use strict';

let express = require('express')
const multipart = require('connect-multiparty');
const config = require('../../config.js');
const multipartMiddleware = multipart({
  uploadDir: config.upload.tmpDir
});
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let file = require('../../controllers/server/file')

//文件
router.use(function (req, res, next) {
  console.log('文件页: ' + Date.now());
  res.locals.Path = 'file';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});
//内容列表
router.route('/').get(action.checkAction('FILE_INDEX'), file.list);
//添加内容
router.route('/add').all(action.checkAction('FILE_CREATE'), multipartMiddleware, file.add);
//单条信息
router.route('/:id').get(action.checkAction('FILE_DETAIL'), file.one);
//更新信息
router.route('/:id/edit').all(action.checkAction('FILE_UPDATE'), file.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('FILE_DELETE'), file.del);


module.exports = function (app) {
  let path = util.translateAdminDir('/file');
  app.use(path, router);
};
