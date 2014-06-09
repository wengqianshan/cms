var express = require('express');
var router = express.Router();
var user = require('../../app/controllers/user');

//首页
router.get('/', function(req, res) {
    res.render('app/index', { title: 'CMS系统前台' });
});

module.exports = function(app) {
    app.use('/', router);
};
