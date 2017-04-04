'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let page = require('../../controllers/server/page')

//权限判断
router.use(function(req, res, next) {
    console.log('通知页: ' + Date.now());
    res.locals.Path = 'page';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//发信
router.route('/add').all(action.checkAction('PAGE_CREATE'), page.add);
//单条信息
router.route('/:id').get(action.checkAction('PAGE_DETAIL'), page.one);
//删除信息
router.route('/:id/del').all(action.checkAction('PAGE_DELETE'), page.del);
//内容列表
router.route('/').get(action.checkAction('PAGE_INDEX'), page.list);

module.exports = function(app) {
    let path = core.translateAdminDir('/page');
    app.use(path, router);
};
