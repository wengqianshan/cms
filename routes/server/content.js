var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var content = require('../../controllers/server/content');
var _ = require('underscore');

//权限判断
router.use(function(req, res, next) {
    console.log('内容页: ' + Date.now());
    res.locals.Path = 'content';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('content') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});

var ACTION = {
    name: '内容管理',
    actions: [
        {
            name: '内容列表查看',
            value: 'CONTENT_INDEX',
            description: '内容列表查看'
        },{
            name: '发布内容',
            value: 'CONTENT_CREATE',
            description: '发布内容'
        },{
            name: '单页浏览',
            value: 'CONTENT_DETAIL',
            description: '单页浏览'
        },{
            name: '编辑内容',
            value: 'CONTENT_UPDATE',
            description: '编辑内容'
        },{
            name: '删除内容',
            value: 'CONTENT_DELETE',
            description: '删除内容'
        }
    ]
};
// 检查权限中间件
function checkAction(actionName) {
    console.log(actionName)
    return function (req, res, next) {
        console.log(req.Actions)
        if (req.Roles.indexOf('admin') > -1) {
            return next();
        }
        var result = false;

        if (_.isArray(actionName)) {
            result = _.intersection(req.Actions, actionName).length === actionName.length;
        } else if(_.isString(actionName)) {
            result = req.Actions.indexOf(actionName) > -1;
        }

        if (result) {
            return next();
        } else {
            if (req.xhr) {
                res.json({
                    success: false,
                    msg: '无权访问'
                })
            } else {
                res.send('无权访问');
            }
        }
    };
}

//内容列表
router.route('/').get(checkAction('CONTENT_INDEX'), content.list);
//添加内容
router.route('/add').all(checkAction('CONTENT_CREATE'), content.add);
//单条信息
router.route('/:id').get(checkAction('CONTENT_DETAIL'), content.one);
//更新信息
router.route('/:id/edit').all(checkAction('CONTENT_UPDATE'), content.edit);
//删除信息
router.route('/:id/del').all(checkAction('CONTENT_DELETE'), content.del);


module.exports = function(app) {
    var path = core.translateAdminDir('/content');
    app.use(path, router);
};
