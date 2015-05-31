var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var category = require('../../controllers/server/category');

//权限判断
router.use(function(req, res, next) {
    console.log('分类页: ' + Date.now());
    res.locals.Path = 'category';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('category') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(category.list);
//添加内容
router.route('/add').all(category.add);
//单条信息
router.route('/:id').get(category.one);
//更新信息
router.route('/:id/edit').all(category.edit);
//删除信息
router.route('/:id/del').all(category.del);

module.exports = function(app) {
    var path = core.translateAdminDir('/category');
    app.use(path, router);
};
