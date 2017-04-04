'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let category = require('../../controllers/server/category')

//权限判断
router.use(function(req, res, next) {
    console.log('分类页: ' + Date.now());
    res.locals.Path = 'category';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(action.checkAction('CATEGORY_INDEX'), category.list);
//添加内容
router.route('/add').all(action.checkAction('CATEGORY_CREATE'), category.add);
//单条信息
router.route('/:id').get(action.checkAction('CATEGORY_DETAIL'), category.one);
//更新信息
router.route('/:id/edit').all(action.checkAction('CATEGORY_UPDATE'), category.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('CATEGORY_DELETE'), category.del);

module.exports = function(app) {
    let path = core.translateAdminDir('/category');
    app.use(path, router);
};
