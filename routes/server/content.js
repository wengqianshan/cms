'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let content = require('../../controllers/server/content')

//权限判断
router.use(function(req, res, next) {
    console.log('内容页: ' + Date.now());
    res.locals.Path = 'content';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//内容列表
router.route('/').get(action.checkAction('CONTENT_INDEX'), content.list);
//添加内容
router.route('/add').all(action.checkAction('CONTENT_CREATE'), content.add);
//更新信息
router.route('/:id/edit').all(action.checkAction('CONTENT_UPDATE'), content.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('CONTENT_DELETE'), content.del);


module.exports = function(app) {
    let path = core.translateAdminDir('/content');
    app.use(path, router);
};
