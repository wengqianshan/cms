'use strict';
var mongoose = require('mongoose'),
    Role = mongoose.model('Role'),
    userController = require('./user'),
    _ = require('underscore'),
    core = require('../../libs/core');
//列表
exports.list = function(req, res) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Role.count(condition, function(err, total) {
        var query = Role.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(results)
            res.render('server/role/list', {
                roles: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        });
    })
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Role.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        res.render('server/role/item', {
            title: result.name,
            role: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/role/add', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {
        var obj = req.body;
        //转为数组格式
        var actions = obj.actions.split(',');
        //去空
        actions = _.without(actions, '');
        //去头尾空格
        actions = _.map(actions, function(action) {
            return action.trim();
        })
        obj.actions = actions;
        //如果不是管理员，检查是否超出权限
        if(req.Roles.indexOf('admin') === -1) {
            var overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
            if(overAuth.length > 0) {
                return res.render('server/info', {
                    message: '你不能操作如下权限:' + overAuth.join(',')
                });
            }
        }
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var role = new Role(obj);
        role.save(function(err, role) {
            if (err) {
                return res.render('server/info', {
                    message: '创建失败'
                });
            }
            res.render('server/info', {
                message: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Role.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            if(result.status === 201) {
                return res.render('server/info', {
                    message: '系统默认管理员角色不可修改'
                });   
            }
            if(result.actions) {
                result.actions = result.actions.join(',');    
            }
            res.render('server/role/edit', {
                role: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        //转为数组格式
        var actions = obj.actions.split(',');
        //去空
        actions = _.without(actions, '');
        //去头尾空格
        actions = _.map(actions, function(action) {
            return action.trim();
        })
        obj.actions = actions;
        Role.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            if(result.status === 201) {
                return res.render('server/info', {
                    message: '系统默认管理员角色不可修改'
                });   
            }
            //如果不是管理员，检查是否超出权限
            if(req.Roles.indexOf('admin') === -1) {
                var overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
                if(overAuth.length > 0) {
                    return res.render('server/info', {
                        message: '你不能操作如下权限:' + overAuth.join(',')
                    });
                }
            }
            _.extend(result, obj);
            result.save(function(err, role) {
                if(err || !role) {
                    return res.render('server/info', {
                        message: '更新失败'
                    });
                }
                //重置session信息
                userController.reload(req.session.user._id, function(err, user) {
                    req.session.user = user;
                    res.locals.User = user;
                    if(!err) {
                        res.render('server/info', {
                            message: '更新成功'
                        });
                    }
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Role.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '角色不存在'
            });
        }
        if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        if(result.status === 201 || result.status === 202) {
            return res.render('server/info', {
                message: '系统默认角色不可删除'
            });   
        }
        result.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败222'
                });
            }
            /*res.render('server/info', {
                message: '删除成功'
            })*/
            //重置session信息
            userController.reload(req.session.user._id, function(err, user) {
                req.session.user = user;
                res.locals.User = user;
                if(!err) {
                    res.render('server/info', {
                        message: '删除成功'
                    });
                }
            });
        });
    });
};