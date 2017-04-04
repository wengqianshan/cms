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
router.route('/users')
    .get(user.list);
router.route('/users/:id')
    .get(user.item)
    .put()
    .post()
    .delete();

module.exports = function(app) {
    app.use('/api/v1', router);
};
