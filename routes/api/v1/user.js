'use strict';

let express = require('express')
let router = express.Router()
let user = require('../../../controllers/api/v1/user')

//
router.use(function(req, res, next) {
    //console.log('api: ' + Date.now());
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});

router.route('/:id')
    .get(user.show)
    .put(user.update)
    .delete(user.destroy);

router.route('/:id/update')
    .post(user.update)

router.route('/:id/destroy')
    .post(user.destroy)

router.route('/')
    .get(user.all)
    .post(user.create)

module.exports = function(app) {
    app.use('/api/v1/user', router);
};
