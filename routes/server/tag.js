'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let tag = require('../../controllers/server/tag')

//权限判断
router.use(function(req, res, next) {
    console.log('标签页: ' + Date.now());
    res.locals.Path = 'tag';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});
//标签列表
router.route('/').get(action.checkAction('TAG_INDEX'), tag.list);
//添加标签
router.route('/add').all(action.checkAction('TAG_CREATE'), tag.add);
//单条信息
router.route('/:id').get(action.checkAction('TAG_DETAIL'), tag.one);
//更新信息
router.route('/:id/edit').all(action.checkAction('TAG_UPDATE'), tag.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('TAG_DELETE'), tag.del);

module.exports = function(app) {
    let path = core.translateAdminDir('/tag');
    app.use(path, router);
};
