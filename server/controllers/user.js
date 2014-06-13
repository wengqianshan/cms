'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    config = require('../../config'),
    util = require('../libs/util'),
    _ = require('underscore');

//用户登录校验
exports.authenticate = function(req, res, next) {
    if (!req.session.user) {
        var path = util.translateAdminDir('/user/login');
        return res.redirect(path);
    } else {
        next();
    }
};
//用户列表
exports.list = function(req, res) {
    User.count(function(err, total) {
        var query = User.find({}).populate('roles');
        //分页
        var pageInfo = util.createPage(req.query.page, total, 10, req);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/user/list', {
                title: '内容列表',
                users: results,
                pageInfo: pageInfo
            });
        });
    })
}
//单个用户
exports.one = function(req, res) {
    var id = req.param('id');
    User.findById(id).populate('roles').exec(function(err, result) {
        res.render('server/user/item', {
            user: result
        });
    });
};
//注册
exports.register = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('server/user/register', {});
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        //默认角色
        Role.findOne({name: config.admin.role.user}, function(err, role) {
            console.log('role', role);
            if(err || !role) {
                return res.render('server/message', {
                    msg: '注册失败, 未开放角色:' + config.admin.role.user
                });
            }
            obj.roles = [role._id];
            var user = new User(obj);
            user.save(function(err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    return res.render('server/message', {
                        msg: '注册失败'
                    });
                }
                res.render('server/message', {
                    msg: '注册成功'
                });
            });
        });
    }
};
//添加
exports.add = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('server/user/add', {});
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        //默认角色
        Role.findOne({name: config.admin.role.user}, function(err, role) {
            console.log('role', role);
            if(err || !role) {
                return res.render('server/message', {
                    msg: '添加失败, 未开放角色:' + config.admin.role.user
                });
            }
            obj.roles = [role._id];
            var user = new User(obj);
            user.save(function(err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    return res.render('server/message', {
                        msg: '添加失败'
                    });
                }
                res.render('server/message', {
                    msg: '添加成功'
                });
            });
        });
    }
};

//编辑
exports.edit = function(req, res) {
    var id = req.params.id;
    var editHandler = function(user) {
        user.save(function(err, user) {
            if(id === req.session.user._id) {
                req.session.user = user;
                res.locals.User = user;
            }
            res.render('server/message', {
                msg: '更新成功'
            });
        })
    };
    if(req.method === 'GET') {
        User.findById(id, function(err, result) {
            try{
                Role.find(function(err, results) {
                    if(!err && results) {
                        res.render('server/user/edit', {
                            user: result,
                            roles: results
                        });
                    }
                }) 
            }catch(e) {
               res.render('server/user/edit', {
                    user: result
                });
            }
        })
    } else if(req.method === 'POST') {
        var obj = req.body;
        //判断是否允许编辑
        User.findById(id).populate('roles').exec(function(err, user) {
            var roles = util.getRoles(user);
            //啊 这个人是管你员
            if(roles.indexOf(config.admin.role.admin) > -1) {
                //啊 这个人是管你员 我得好好研究研究
                //console.log('管理员', user);
                Role.find({_id: {$in: obj.roles}}).exec(function(err, roles) {
                    var newRoles = _.pluck(roles, 'name');
                    console.log(newRoles);
                    if(newRoles.indexOf(config.admin.role.admin) > -1) {
                        //还是管理员
                        _.extend(user, obj);
                        editHandler(user);
                    }else{
                        //不是了, 看看还有管理员吗
                        User.find({}).populate('roles').exec(function(err, results) {
                            var len = 0;
                            //统计当前管理员人数
                            results.forEach(function(user) {
                                if(user.roles && user.roles.length > 0) {
                                    user.roles.forEach(function(role) {
                                        if(role.name === config.admin.role.admin) {
                                            len ++;
                                        }
                                    })
                                }
                            });
                            if (len > 1) {
                                _.extend(user, obj);
                                console.log('还有管理员');
                                editHandler(user);
                            }else {
                                res.render('server/message', {
                                    msg: '至少要有一个管理员'
                                });
                            }
                        });
                    }
                });
            }else{
                //屁民一个，爱咋地咋地
                _.extend(user, obj);
                console.log('小角色', user);
                editHandler(user);
            }
        });
        /*User.findByIdAndUpdate(id, obj).populate('roles').exec(function(err, user) {
            console.log(err, user);
            if(!err) {
                console.log(id, req.session.user._id);
                if(id === req.session.user._id) {
                    req.session.user = user;
                    res.locals.User = user;
                }
                res.render('server/message', {
                    msg: '更新成功'
                });
            }
        })*/
    }
};

//删除
exports.del = function(req, res) {
    var deleteHandle = function(user) {
        user.remove(function(err) {
            if(err) {
                return res.render('server/message', {
                    msg: '删除失败222'
                });
            }
            res.render('server/message', {
                msg: '删除成功'
            })
        });
    };
    var id = req.params.id;
    User.findById(id).populate('roles').exec(function(err, result) {
        if(!result) {
            return res.render('server/message', {
                msg: '用户不存在'
            });
        }
        //看看删除的是不是管理员
        var roles = util.getRoles(result);
        if(roles.indexOf(config.admin.role.admin) > -1) {
            console.log('这个是管理员');
            User.find({}).populate('roles').exec(function(err, results) {
                var len = 0;
                //统计当前管理员人数
                results.forEach(function(user) {
                    if(user.roles && user.roles.length > 0) {
                        user.roles.forEach(function(role) {
                            if(role.name === config.admin.role.admin) {
                                len ++;
                            }
                        })
                    }
                });
                if (len > 1) {
                    deleteHandle(result);
                }else {
                    res.render('server/message', {
                        msg: '不能删除最后一个管理员'
                    });
                }
            });
        }else{
            deleteHandle(result);
        }
    });
}

//登录
exports.login = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/user/login');
    } else if (req.method === 'POST') {
        var username = req.body.username;
        var password = req.body.password;
        User.findOne({
            username: username
        }).populate('roles').exec(function(err, user) {
            //var ruleObj = user.roleToObj();
            //console.log(ruleObj)
            //console.log(user.hasRole('admin'));
            //console.log(user.hasAction('read'));
            if (!user) {
                return res.render('server/message', {
                    msg: '登录失败, 查无此人'
                });
            }
            /*checkAction('dev', user._id, function(u) {
                console.log('鉴定成功', u);
            }, function(u) {
                console.log('鉴定失败', u)
            });*/
            if (user.authenticate(password)) {
                console.log('登录成功');
                console.log(user);
                req.session.user = user;
                var path = util.translateAdminDir('/');
                res.redirect(path);
            } else {
                res.render('server/message', {
                    msg: '密码不正确'
                });
            }
        });
    }

};
//更新用户session信息
exports.reload = function(uid, callback) {
    User.findById(uid).populate('roles').exec(function(err, user) {
        callback && callback.call(null, err, user);
    });
};

//注销
exports.logout = function(req, res) {
    if (req.session) {
        req.session.destroy();
        res.locals.User = null;
        console.log('注销成功');
        /*res.render('server/message', {
            msg: '注销成功'
        });*/
        var path = util.translateAdminDir('/');
        res.redirect(path);
    } else {
        res.render('server/message', {
            msg: '注销失败'
        });
    }
};

//修改密码
exports.changePassword = function(req, res) {
    var obj = req.body;
    User.findById(obj.id, function(err, user) {
        user.password = obj.password;
        user.save(function(err, result) {
            res.render('server/message', {
                msg: '修改密码成功'
            });
            console.log('修改密码成功', result);
        })
    });
};