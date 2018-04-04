'use strict';

let express = require('express')
let router = express.Router()
let user = require('../../../controllers/api/v1/user')
let jwtMiddleWare = require('../../../middlewares/jwt')
let action = require('../../../middlewares/action')

//
router.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type,Authorization')
    next();
});

router.route('/auth')
    .post(user.auth)

// TEST
router.route('/verify')
    .get(jwtMiddleWare.verify, user.verify)

router.route('/:id')
    .get(user.show)
    .put(jwtMiddleWare.verify, action.checkAction('USER_UPDATE'), user.update)
    .delete(jwtMiddleWare.verify, action.checkAction('USER_DELETE'), user.destroy);

router.route('/:id/update')
    .post(jwtMiddleWare.verify, action.checkAction('USER_UPDATE'), user.update)

router.route('/:id/destroy')
    .post(jwtMiddleWare.verify, action.checkAction('USER_DELETE'), user.destroy)

router.route('/register')
    .post(user.create)

router.route('/')
    .get(jwtMiddleWare.verify, action.checkAction('USER_INDEX'), user.all)
    .post(jwtMiddleWare.verify, action.checkAction('USER_CREATE'), user.create)

router.use(function(req, res) {
    res.json({
        success: false,
        error: '无效请求'
    })
})


module.exports = function(app) {
    app.use('/api/v1/user', router);
};
