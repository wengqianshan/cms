var express = require('express');
var router = express.Router();
var content = require('../../../controllers/api/v1/content');

//
router.use(function(req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/contents').all(content.list);
router.route('/contents/:id').all(content.item);

module.exports = function(app) {
    app.use('/api/v1', router);
};