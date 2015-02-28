var express = require('express');
var router = express.Router();
var file = require('../../controllers/api/file');

//首页
router.route('/file').all(file.list);
router.route('/file/:id').all(file.one);

module.exports = function(app) {
    app.use('/api', router);
};
