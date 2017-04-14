'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let notification = require('../../controllers/server/notification')

//权限判断
router.use(function(req, res, next) {
    console.log('通知页: ' + Date.now());
    res.locals.Path = 'notification';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//已发出
router.route('/sent').get(action.checkAction('NOTIFICATION_INDEX'), notification.sent);
router.route('/received').get(action.checkAction('NOTIFICATION_INDEX'), notification.received);
//发信
router.route('/add').all(action.checkAction('NOTIFICATION_CREATE'), notification.add);
//单条信息
router.route('/:id').get(action.checkAction('NOTIFICATION_DETAIL'), notification.one);
//删除信息
router.route('/:id/del').all(action.checkAction('NOTIFICATION_DELETE'), notification.del);
//内容列表
router.route('/').get(action.checkAction('NOTIFICATION_INDEX'), notification.list);

module.exports = function(app) {
    let path = core.translateAdminDir('/notification');
    app.use(path, router);
};
