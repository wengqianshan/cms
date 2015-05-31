var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var message = require('../../controllers/server/message');

//权限判断
router.use(function(req, res, next) {
    console.log('评论页: ' + Date.now());
    res.locals.Path = 'message';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('message') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});
//内容列表
router.route('/').get(message.list);
//单条信息
router.route('/:id').get(message.one);
//删除信息
router.route('/:id/del').all(message.del);

module.exports = function(app) {
    var path = core.translateAdminDir('/message');
    app.use(path, router);
};
