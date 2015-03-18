var express = require('express');
var router = express.Router();
var file = require('../../controllers/api/file');

//
router.use(function(req, res, next) {
    console.log('api: ' + Date.now());
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/file').all(file.list);
router.route('/file/:id').all(file.one);

module.exports = function(app) {
    app.use('/api', router);
};
