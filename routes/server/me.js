var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var me = require('../../controllers/server/me');

//首页
router.use(function(req, res, next) {
    console.log('管理员信息: ' + Date.now());
    res.locals.Path = 'me';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0)) {
        //var path = core.translateAdminDir('/');
        //return res.redirect(path);
    }
    next();
});
router.get('/', me.init);
router.route('/edit').all(me.edit);
router.route('/updatepwd').all(me.updatePassword);

module.exports = function(app) {
    var path = core.translateAdminDir('/me');
    app.use(path, router);
};
