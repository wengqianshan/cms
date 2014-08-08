var express = require('express');
var router = express.Router();
var index = require('../../app/controllers/index');

//首页
router.route('/').all(index.index);

module.exports = function(app) {
    app.use('/', router);
};
