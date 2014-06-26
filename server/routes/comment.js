var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var comment = require('../../server/controllers/comment');

//权限判断
router.use(function(req, res, next) {
    console.log('评论页: ' + Date.now());
    res.locals.Path = 'comment';
    if(!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('comment') < 0)) {
        var path = util.translateAdminDir('/index');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(comment.list);
//单条信息
router.route('/:id').get(comment.one);
//删除信息
router.route('/:id/del').all(comment.del);

module.exports = function(app) {
    var path = util.translateAdminDir('/comment');
    app.use(path, router);
};
