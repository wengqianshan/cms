'use strict';

let express = require('express')
let router = express.Router()
let content = require('../../../controllers/api/v1/content')

//
router.use(function(req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/contents')
    .get(content.list);
router.route('/contents/:id')
    .get(content.item)
    .put()
    .post()
    .delete()

module.exports = function(app) {
    app.use('/api/v1', router);
};