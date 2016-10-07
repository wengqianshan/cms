var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var action = require('../../middlewares/action');
var notification = require('../../controllers/server/notification');

//权限判断
router.use(function(req, res, next) {
    console.log('通知页: ' + Date.now());
    res.locals.Path = 'notification';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
   /* if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('notification') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }*/
    next();
});

//已发出
router.route('/sent').get(action.checkAction('NOTIFICATION_INDEX'), notification.sent);
//发信
router.route('/add').all(action.checkAction('NOTIFICATION_CREATE'), notification.add);
//单条信息
router.route('/:id').get(action.checkAction('NOTIFICATION_DETAIL'), notification.one);
//删除信息
router.route('/:id/del').all(action.checkAction('NOTIFICATION_DELETE'), notification.del);
//内容列表
router.route('/').get(action.checkAction('NOTIFICATION_INDEX'), notification.list);

module.exports = function(app) {
    var path = core.translateAdminDir('/notification');
    app.use(path, router);
};
