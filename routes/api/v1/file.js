'use strict';

let express = require('express')
let router = express.Router()
let file = require('../../../controllers/api/v1/file')

//
router.use(function(req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/files')
    .get(file.list);
router.route('/files/:id')
    .get(file.item)
    .put()
    .post()
    .delete();

module.exports = function(app) {
    app.use('/api/v1', router);
};
