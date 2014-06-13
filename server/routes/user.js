var express = require('express');
var router = express.Router();

var user = require('../../server/controllers/user');
var util = require('../libs/util');


router.use(function(req, res, next) {
    res.locals.Path = 'user';
    next();
});
//登录
router.route('/login').all(user.login);
//注册
router.route('/register').all(user.register);

//注销
router.route('/logout').all(user.logout);

//权限判断
router.use(function(req, res, next) {
    if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(req.Roles && req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('user') < 0) {
        var path = util.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//添加
router.route('/add').all(user.add);
//单个用户
router.route('/:id').get(user.one);
//编辑用户信息
router.route('/:id/edit').all(user.edit);
//删除用户
router.route('/:id/del').all(user.del);
//用户列表
router.route('/').get(user.list);


module.exports = function(app) {
    var config = app.get('config');
    var path = (config.admin.dir ? '/' + config.admin.dir : '') + '/user';
    app.use(path, router);
};
