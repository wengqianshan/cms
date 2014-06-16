var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var index = require('../../server/controllers/index');

//首页
router.use(function(req, res, next) {
    console.log('首页: ' + Date.now());
    res.locals.Path = 'index';
    /*if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }*/
    next();
});
router.route('/install').all(index.install);
//router.use(index.checkInstall);
router.get('/', index.index);
router.get('/me', index.me);


module.exports = function(app) {
    var path = util.translateAdminDir('/index');
    app.use(path, router);
    var adminPath = util.translateAdminDir('')
    app.use(adminPath, index.checkInstall);
};
