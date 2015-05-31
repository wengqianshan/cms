var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var file = require('../../controllers/server/file');

//文件
router.use(function(req, res, next) {
    console.log('文件页: ' + Date.now());
    res.locals.Path = 'file';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('file') < 0)) {
        var path = core.translateAdminDir('/');
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
    var path = core.translateAdminDir('/file');
    app.use(path, router);
};
