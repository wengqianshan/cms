var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var page = require('../../controllers/server/page');

//权限判断
router.use(function(req, res, next) {
    console.log('通知页: ' + Date.now());
    res.locals.Path = 'page';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    /*if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('page') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }*/
    next();
});

//发信
router.route('/add').all(core.checkAction('PAGE_CREATE'), page.add);
//单条信息
router.route('/:id').get(core.checkAction('PAGE_DETAIL'), page.one);
//删除信息
router.route('/:id/del').all(core.checkAction('PAGE_DELETE'), page.del);
//内容列表
router.route('/').get(core.checkAction('PAGE_INDEX'), page.list);

module.exports = function(app) {
    var path = core.translateAdminDir('/page');
    app.use(path, router);
};
