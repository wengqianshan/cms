var express = require('express');
var router = express.Router();
var api = require('../../controllers/api/');

//首页
router.route('/file').all(api.file);
router.route('/file/:id').all(api.one);

module.exports = function(app) {
    app.use('/api', router);
};
