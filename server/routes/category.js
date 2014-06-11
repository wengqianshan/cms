var express = require('express');
var router = express.Router();

var util = require('../libs/util');
var category = require('../../server/controllers/category');
var user = require('../../server/controllers/user');

//权限判断
router.use(function(req, res, next) {
    if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    var roles = user.getRoles(req.session.user);
    var actions = user.getActions(req.session.user);
    if(roles.indexOf('admin') < 0 && actions.indexOf('category') < 0) {
        var path = util.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//添加内容
router.route('/add').all(category.add);
//单条信息
router.route('/:id').get(category.one);
//更新信息
router.route('/:id/edit').all(category.edit);
//删除信息
router.route('/:id/del').all(category.del);
//内容列表
router.route('/').get(category.list);

module.exports = function(app) {
    //app.use('/category', router);
    var config = app.get('config');
    var path = (config.admin.dir ? '/' + config.admin.dir : '') + '/category';
    app.use(path, router);
};
