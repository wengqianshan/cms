'use strict';

let express = require('express')
let router = express.Router()
let role = require('../../../controllers/api/v1/role')
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
  .get(jwtMiddleWare.verify, action.checkAction('ROLE_INDEX'), role.show)
  .put(jwtMiddleWare.verify, action.checkAction('ROLE_UPDATE'), role.update)
  .delete(jwtMiddleWare.verify, action.checkAction('ROLE_DELETE'), role.destroy)

router.route('/:id/update')
  .post(jwtMiddleWare.verify, action.checkAction('ROLE_UPDATE'), role.update)

router.route('/:id/destroy')
  .post(jwtMiddleWare.verify, action.checkAction('ROLE_DELETE'), role.destroy)

router.route('/')
  .get(jwtMiddleWare.verify, action.checkAction('ROLE_INDEX'), role.all)
  .post(jwtMiddleWare.verify, action.checkAction('CONTENT_CREATE'), role.create)

router.use(function (req, res) {
  res.json({
    success: false,
    error: '无效请求'
  })
})

module.exports = function (app) {
  app.use('/api/v1/role', router);
};
