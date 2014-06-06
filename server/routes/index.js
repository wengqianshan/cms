var express = require('express');
var router = express.Router();
var user = require('../../server/controllers/user');

//首页
router.get('/', function(req, res) {
    res.render('index', { title: 'CMS系统' });
});

module.exports = function(app) {
    app.use('/', router);
};
