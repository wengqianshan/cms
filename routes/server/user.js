var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var user = require('../../controllers/server/user');

//权限判断
router.use(function(req, res, next) {
    console.log('用户页: ' + Date.now());
    res.locals.Path = 'user';
    next();
});
//登录
router.route('/login').all(user.checkInstall, user.login);
//注册
router.route('/register').all(user.register);

//注销
router.route('/logout').all(user.logout);
//忘记密码
router.route('/forget').all(user.forget);


//权限判断
router.use(function(req, res, next) {
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('user') < 0)) {
        var path = core.translateAdminDir('/index');
        return res.redirect(path);
    }
    next();
});
//用户列表
router.route('/').get(user.list);
//添加
router.route('/add').all(user.add);
//单个用户
router.route('/:id').get(user.one);
//编辑用户信息
router.route('/:id/edit').all(user.edit);
//删除用户
router.route('/:id/del').all(user.del);



module.exports = function(app) {
    var path = core.translateAdminDir('/user');
    app.use(path, router);
};
