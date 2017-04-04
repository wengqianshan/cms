'use strict';
/**
 ** 这个页面文件名比较特殊，为了能在最后加载所以前面加了个z,对应controller是index.js
 **
 */
let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let index = require('../../controllers/server/index')

//首页
router.use(function(req, res, next) {
    console.log('首页: ' + Date.now());
    res.locals.Path = 'index';
    next();
});
router.get('/', index.index);
router.route('/install').all(index.install);

module.exports = function(app) {
    let path = core.translateAdminDir('/');
    app.use(path, router);
};
