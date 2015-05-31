var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var tag = require('../../controllers/server/tag');

//权限判断
router.use(function(req, res, next) {
    console.log('标签页: ' + Date.now());
    res.locals.Path = 'tag';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('tag') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//标签列表
router.route('/').get(tag.list);
//添加标签
router.route('/add').all(tag.add);
//单条信息
router.route('/:id').get(tag.one);
//更新信息
router.route('/:id/edit').all(tag.edit);
//删除信息
router.route('/:id/del').all(tag.del);

module.exports = function(app) {
    var path = core.translateAdminDir('/tag');
    app.use(path, router);
};
