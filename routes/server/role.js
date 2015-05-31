var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var role = require('../../controllers/server/role');

//权限判断
router.use(function(req, res, next) {
    console.log('角色页: ' + Date.now());
    res.locals.Path = 'role';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('role') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(role.list);
//添加内容
router.route('/add').all(role.add);
//单条信息
router.route('/:id').get(role.one);
//更新信息
router.route('/:id/edit').all(role.edit);
//删除信息
router.route('/:id/del').all(role.del);


module.exports = function(app) {
    var path = core.translateAdminDir('/role');
    app.use(path, router);
};
