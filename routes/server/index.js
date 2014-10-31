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
    var path = core.translateAdminDir('/index');
    app.use(path, router);
};
