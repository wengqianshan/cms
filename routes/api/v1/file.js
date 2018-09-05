'use strict';

let express = require('express')
const multipart = require('connect-multiparty');
const config = require('../../../config.js');
const multipartMiddleware = multipart({
  uploadDir: config.upload.tmpDir
});
let router = express.Router()
let file = require('../../../controllers/api/v1/file')
let jwtMiddleWare = require('../../../middlewares/jwt')
let action = require('../../../middlewares/action')

//
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type,Authorization')
  next();
});

router.route('/:id')
  .get(file.show)
  .put(jwtMiddleWare.verify, action.checkAction('FILE_UPDATE'), file.update)
  .delete(jwtMiddleWare.verify, action.checkAction('FILE_DELETE'), file.destroy);

router.route('/:id/update')
  .post(jwtMiddleWare.verify, action.checkAction('FILE_UPDATE'), file.update)

router.route('/:id/destroy')
  .post(jwtMiddleWare.verify, action.checkAction('FILE_DELETE'), file.destroy)

router.route('/upload')
  .all(jwtMiddleWare.verify, action.checkAction('FILE_CREATE'), multipartMiddleware, file.upload)

router.route('/')
  .get(file.all)
  .post(jwtMiddleWare.verify, action.checkAction('FILE_CREATE'), file.create)

router.use(function (req, res) {
  res.json({
    success: false,
    error: '无效请求'
  })
})

module.exports = function (app) {
  app.use('/api/v1/file', router);
};
