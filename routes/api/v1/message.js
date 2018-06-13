'use strict';

let express = require('express')
let router = express.Router()
let message = require('../../../controllers/api/v1/message')
let jwtMiddleWare = require('../../../middlewares/jwt')
let action = require('../../../middlewares/action')

//
router.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type,Authorization')
    next();
});

router.route('/:id')
    .get(jwtMiddleWare.verify, action.checkAction('MESSAGE_DETAIL'), message.show)
    .put(jwtMiddleWare.verify, action.checkAction('MESSAGE_UPDATE'), message.update)
    .delete(jwtMiddleWare.verify, action.checkAction('MESSAGE_DELETE'), message.destroy)

router.route('/:id/update')
    .post(jwtMiddleWare.verify, action.checkAction('MESSAGE_UPDATE'), message.update)

router.route('/:id/destroy')
    .post(jwtMiddleWare.verify, action.checkAction('MESSAGE_DELETE'), message.destroy)
    
router.route('/')
    .get(jwtMiddleWare.verify, action.checkAction('MESSAGE_INDEX'), message.all)
    .post(message.create)

router.use(function(req, res) {
    res.json({
        success: false,
        error: '无效请求'
    })
})

module.exports = function(app) {
    app.use('/api/v1/message', router);
};