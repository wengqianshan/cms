'use strict';

let express = require('express')
let router = express.Router()
let content = require('../../../controllers/api/v1/content')
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
  .get(content.show)
  .put(jwtMiddleWare.verify, action.checkAction('CONTENT_UPDATE'), content.update)
  .delete(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.destroy)

router.route('/:id/update')
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_UPDATE'), content.update)

router.route('/:id/destroy')
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.destroy)

router.route('/')
  .get(content.all)
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_CREATE'), content.create)
  .delete(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.deleteBatch)

// router.use(function (req, res) {
//   res.json({
//     success: false,
//     error: '无效请求'
//   })
// })

module.exports = function (app) {
  app.use('/api/v1/content', router);
};
