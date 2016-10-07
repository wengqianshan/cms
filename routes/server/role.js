var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var action = require('../../middlewares/action');
var role = require('../../controllers/server/role');

//权限判断
router.use(function(req, res, next) {
    console.log('角色页: ' + Date.now());
    res.locals.Path = 'role';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    /*if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('role') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }*/
    next();
});
//内容列表
router.route('/').get(action.checkAction('ROLE_INDEX'), role.list);
//添加内容
router.route('/add').all(action.checkAction('ROLE_CREATE'), role.add);
//单条信息
router.route('/:id').get(action.checkAction('ROLE_DETAIL'), role.one);
//更新信息
router.route('/:id/edit').all(action.checkAction('ROLE_UPDATE'), role.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('ROLE_DELETE'), role.del);


module.exports = function(app) {
    var path = core.translateAdminDir('/role');
    app.use(path, router);
};
