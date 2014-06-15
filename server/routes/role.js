var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var role = require('../../server/controllers/role');

//权限判断
router.use(function(req, res, next) {
    console.log('角色页: ' + Date.now());
    res.locals.Path = 'role';
    if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(req.Roles && req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('role') < 0) {
        var path = util.translateAdminDir('/index');
        return res.redirect(path);
    }
    next();
});
//添加内容
router.route('/add').all(role.add);
//单条信息
router.route('/:id').get(role.one);
//更新信息
router.route('/:id/edit').all(role.edit);
//删除信息
router.route('/:id/del').all(role.del);
//内容列表
router.route('/').get(role.list);

module.exports = function(app) {
    var path = util.translateAdminDir('/role');
    app.use(path, router);
};
