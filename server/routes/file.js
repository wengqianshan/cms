var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var file = require('../../server/controllers/file');

//权限判断
router.use(function(req, res, next) {
    console.log('角色页: ' + Date.now());
    res.locals.Path = 'file';
    if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('file') < 0)) {
        var path = util.translateAdminDir('/index');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(file.list);
//添加内容
router.route('/add').all(file.add);
//单条信息
router.route('/:id').get(file.one);
//更新信息
router.route('/:id/edit').all(file.edit);
//删除信息
router.route('/:id/del').all(file.del);


module.exports = function(app) {
    var path = util.translateAdminDir('/file');
    app.use(path, router);
};
