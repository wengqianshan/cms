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
  .get(content.item)
  .put(jwtMiddleWare.verify, action.checkAction('CONTENT_UPDATE'), content.update)
  .delete(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.delete)

router.route('/:id/update')
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_UPDATE'), content.update)

router.route('/:id/destroy')
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.delete)

router
  .route("/:id/up")
  .post(
    jwtMiddleWare.verify,
    action.checkAction("CONTENT_UP"),
    content.up
  );

router.route('/')
  .get(content.list)
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_CREATE'), content.create)
  .delete(jwtMiddleWare.verify, action.checkAction('CONTENT_DELETE'), content.deleteBatch)


module.exports = function (app) {
  app.use('/api/v1/content', router);
};
