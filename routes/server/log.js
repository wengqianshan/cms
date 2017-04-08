'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let log = require('../../controllers/server/log')

//权限判断
router.use(function(req, res, next) {
    console.log('通知页: ' + Date.now());
    res.locals.Path = 'log';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//单条信息
router.route('/:id').get(action.checkAction('LOG_DETAIL'), log.one);
//删除信息
router.route('/:id/del').all(action.checkAction('LOG_DELETE'), log.del);
//内容列表
router.route('/').get(action.checkAction('LOG_INDEX'), log.list);

module.exports = function(app) {
    let path = core.translateAdminDir('/log');
    app.use(path, router);
};
