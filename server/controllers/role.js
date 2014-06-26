'use strict';
var mongoose = require('mongoose'),
    Role = mongoose.model('Role'),
    userController = require('./user'),
    _ = require('underscore'),
    util = require('../libs/util');
//列表
exports.list = function(req, res) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Role.count(condition, function(err, total) {
        var query = Role.find(condition);
        //分页
        var pageInfo = util.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(results)
            res.render('server/role/list', {
                roles: results,
                pageInfo: pageInfo
            });
        });
    })
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Role.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/message', {
                msg: '该内容不存在'
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
        res.render('server/role/add');
    } else if (req.method === 'POST') {
        var obj = req.body;
        obj.actions = obj.actions.split(',').map(function(action) {
            return action.trim();
        });
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var role = new Role(obj);
        role.save(function(err, role) {
            if (err) {
                return res.render('server/message', {
                    msg: '创建失败'
                });
            }
            res.render('server/message', {
                msg: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Role.findById(id).populate('author').exec(function(err, result) {
            if(!result.author) {
                return res.render('server/message', {
                    msg: '只有管理员才能编辑'
                });
            }
            if(req.Roles && req.Roles.indexOf('admin') === -1 && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/message', {
                    msg: '没有权限'
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
        obj.actions = obj.actions.split(',').map(function(action) {
            return action.trim();
        });
        Role.findById(id).populate('author').exec(function(err, result) {
            if(!result.author) {
                return res.render('server/message', {
                    msg: '只有管理员才能编辑'
                });
            }
            if(req.Roles && req.Roles.indexOf('admin') === -1 && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/message', {
                    msg: '没有权限'
                });
            }
            _.extend(result, obj);
            result.save(function(err, role) {
                //重置session信息
                userController.reload(req.session.user._id, function(err, user) {
                    req.session.user = user;
                    res.locals.User = user;
                    if(!err) {
                        res.render('server/message', {
                            msg: '更新成功'
                        });
                    }
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    if(!req.session.user) {
        return res.render('server/message', {
            msg: '请先登录'
        });
    }
    var id = req.params.id;
    Role.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/message', {
                msg: '角色不存在'
            });
        }
        if(!result.author) {
            return res.render('server/message', {
                msg: '只有管理员才能删除'
            });
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && (result.author._id + '') !== req.session.user._id) {
            return res.render('server/message', {
                msg: '没有权限'
            });
        }
        result.remove(function(err) {
            if(err) {
                return res.render('server/message', {
                    msg: '删除失败222'
                });
            }
            /*res.render('server/message', {
                msg: '删除成功'
            })*/
            //重置session信息
            userController.reload(req.session.user._id, function(err, user) {
                req.session.user = user;
                res.locals.User = user;
                if(!err) {
                    res.render('server/message', {
                        msg: '删除成功'
                    });
                }
            });
        });
    });
};