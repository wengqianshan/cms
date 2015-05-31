/**
 ** 这个页面文件名比较特殊，为了能在最后加载所以前面加了个z,对应controller是index.js
 **
 */
var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var index = require('../../controllers/server/index');

//首页
router.use(function(req, res, next) {
    console.log('首页: ' + Date.now());
    res.locals.Path = 'index';
    next();
});
router.get('/', index.index);
router.route('/install').all(index.install);

module.exports = function(app) {
    var path = core.translateAdminDir('/');
    app.use(path, router);
};
