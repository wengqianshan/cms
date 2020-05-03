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

router.use(function (req, res, next) {
  console.log('file: ' + Date.now());
  res.locals.Path = 'file';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('FILE_INDEX'), file.list);

router.route('/add').all(action.checkAction('FILE_CREATE'), multipartMiddleware, file.add);

router.route('/:id').get(action.checkAction('FILE_DETAIL'), file.one);

router.route('/:id/edit').all(action.checkAction('FILE_UPDATE'), file.edit);

router.route('/:id/del').post(action.checkAction('FILE_DELETE'), file.del);


module.exports = function (app) {
  let path = util.translateAdminDir('/file');
  app.use(path, router);
};
