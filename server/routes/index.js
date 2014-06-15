var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var index = require('../../server/controllers/index');

//首页
router.use(function(req, res, next) {
    console.log('首页: ' + Date.now());
    res.locals.Path = '';
    next();
});
router.route('/install').all(index.install);
router.use(index.checkInstall);
router.use(function(req, res, next) {
    if(!req.session.user && req.path.indexOf('login') < 0 && req.path.indexOf('register') < 0) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});
router.get('/', index.index);
router.get('/me', index.me);


module.exports = function(app) {
    var config = app.get('config');
    var path = (config.admin.dir ? '/' + config.admin.dir : '') + '/';
    app.use(path, router);
};
