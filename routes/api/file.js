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
router.route('/files').all(file.list);
router.route('/files/:id').all(file.item);

module.exports = function(app) {
    //app.use('/api', router);
};
