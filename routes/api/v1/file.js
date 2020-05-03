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
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  next();
});

router.route('/:id')
  .get(file.item)
  .put(jwtMiddleWare.verify, action.checkAction('FILE_UPDATE'), file.update)
  .delete(jwtMiddleWare.verify, action.checkAction('FILE_DELETE'), file.delete);

router.route('/:id/update')
  .post(jwtMiddleWare.verify, action.checkAction('FILE_UPDATE'), file.update)

router.route('/:id/destroy')
  .post(jwtMiddleWare.verify, action.checkAction('FILE_DELETE'), file.delete)

router.route('/upload')
  .all(jwtMiddleWare.verify, action.checkAction('FILE_CREATE'), multipartMiddleware, file.upload)

router.route('/')
  .get(file.list)
  .post(jwtMiddleWare.verify, action.checkAction('FILE_CREATE'), file.create)
  .delete(jwtMiddleWare.verify, action.checkAction('FILE_DELETE'), file.deleteBatch)

router.use(function (req, res) {
  res.json({
    success: false,
    error: "invalid request",
  });
})

module.exports = function (app) {
  app.use('/api/v1/file', router);
};
