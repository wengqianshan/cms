'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let comment = require('../../controllers/server/comment')

//权限判断
router.use(function(req, res, next) {
    console.log('评论页: ' + Date.now());
    res.locals.Path = 'comment';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(action.checkAction('COMMENT_INDEX'), comment.list);
//单条信息
router.route('/:id').get(action.checkAction('COMMENT_DETAIL'), comment.one);
//删除信息
router.route('/:id/del').all(action.checkAction('COMMENT_DELETE'), comment.del);

module.exports = function(app) {
    let path = core.translateAdminDir('/comment');
    app.use(path, router);
};
