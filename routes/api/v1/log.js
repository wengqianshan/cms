'use strict';

let express = require('express')
let router = express.Router()
let log = require('../../../controllers/api/v1/log')
let jwtMiddleWare = require('../../../middlewares/jwt')
let action = require('../../../middlewares/action')

//
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type,Authorization')
  next();
});

router.route('/add')
  .get(log.add);

router.route('/:id')
  .get(log.item)
  .delete(jwtMiddleWare.verify, action.checkAction('LOG_DELETE'), log.delete);

router.route('/')
  .get(log.list)
  .post(jwtMiddleWare.verify, action.checkAction('LOG_CREATE'), log.create)
  .delete(jwtMiddleWare.verify, action.checkAction('LOG_DELETE'), log.deleteBatch)

router.use(function (req, res) {
  res.json({
    success: false,
    error: "invalid request",
  });
})

module.exports = function (app) {
  app.use('/api/v1/log', router);
};
