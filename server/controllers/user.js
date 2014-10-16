'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    config = require('../../config'),
    core = require('../../libs/core'),
    crypto = require('../../libs/crypto'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    _ = require('underscore');

// 这个最好移到app.js里面，每次开启服务时检查，
exports.checkInstall = function(req, res, next) {
    if(req.session.user) {
        var path = core.translateAdminDir('/index');
        return res.redirect(path);
    }
    User.find({}, function(err, results) {
        if(err) {
            return;
        }
        if(results.length > 0) {
            // var path = core.translateAdminDir('/user/login');
            // return res.redirect(path);
            return next();
        } else {
            //var path = core.translateAdminDir('/index/install');
            //return res.redirect(path);
            var path = core.translateAdminDir('/index/install')
            return res.send('请先<a href="' + path + '">安装应用</a>');
        }
    })
}
//用户登录校验
exports.authenticate = function(req, res, next) {
    if (!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    } else {
        next();
    }
};
//用户列表
exports.list = function(req, res) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    User.count(condition, function(err, total) {
        var query = User.find(condition).populate('author').populate('roles');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/user/list', {
                title: '内容列表',
                users: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        });
    })
}
//单个用户
exports.one = function(req, res) {
    var id = req.param('id');
    User.findById(id).populate('author').populate('roles').exec(function(err, result) {
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
        Role.findOne({status: 202}, function(err, role) {
            console.log('role', role);
            if(err || !role) {
                return res.render('server/info', {
                    message: '注册失败, 未开放角色:' + config.admin.role.user
                });
            }
            obj.roles = [role._id];
            if (req.session.user) {
                obj.author = req.session.user._id;
            }
            obj.reg_ip = req.ip;
            var user = new User(obj);
            user.save(function(err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    var errors = err.errors;
                    var message = [];
                    for (var i in errors) {
                        message.push(errors[i].message);
                    }
                    return res.render('server/info', {
                        message: '注册失败' + message.join('<br/>')
                    });
                }
                res.render('server/info', {
                    message: '注册成功'
                });
            });
        });
    }
};
//添加
exports.add = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('server/user/add', {
            Menu: 'add'
        });
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        //默认角色
        Role.findOne({status: 202}, function(err, role) {
            console.log('role', role);
            if(err || !role) {
                return res.render('server/info', {
                    message: '添加失败, 未开放角色:' + config.admin.role.user
                });
            }
            obj.roles = [role._id];
            if (req.session.user) {
                obj.author = req.session.user._id;
            }
            var user = new User(obj);
            user.save(function(err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    return res.render('server/info', {
                        message: '添加失败'
                    });
                }
                res.render('server/info', {
                    message: '添加成功'
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
            if(err || !user) {
                console.log(err);
                return res.render('server/info', {
                    message: '更新失败'
                });
            }
            if(id === req.session.user._id) {
                req.session.user = user;
                res.locals.User = user;
            }
            res.render('server/info', {
                message: '更新成功'
            });
        })
    };
    if(req.method === 'GET') {
        User.findById(id).populate('author').exec(function(err, result) {
            if(err || !result) {
                return res.render('server/info', {
                    message: '出错了'
                });
            }
            if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            try{
                var condition = {};
                if(req.Roles.indexOf('admin') < 0) {
                    condition.author = req.session.user._id;
                }
                Role.find(condition, function(err, results) {
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
        User.findById(id).populate('roles').populate('author').exec(function(err, user) {
            if(req.Roles.indexOf('admin') === -1 && (!user.author || (user.author._id + '') !== req.session.user._id)) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            //var roles = core.getRoles(user);
            var oldRoles = core.getRoles(user);
            //啊 这个人是管你员
            var query;
            if(typeof obj.roles === 'string') {
                query = Role.find({_id: obj.roles});
            } else if(typeof obj.roles === 'object') {
                query = Role.find({_id: {$in: obj.roles}})    
            }
            if(!query) {
                return;
            }
            query.exec(function(err, roles) {
                //系统默认管理员
                if(user.status === 101) {
                    var statuses = _.pluck(roles, 'status');
                    if(statuses.indexOf(201) === -1) {
                        return res.render('server/info', {
                            message: '系统管理员角色不正确'
                        });
                    }
                }
                obj.roles = roles;
                _.extend(user, obj);
                editHandler(user);
            });
        });
    }
};

//删除
exports.del = function(req, res) {
    var deleteHandle = function(user) {
        user.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败222'
                });
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    };
    var id = req.params.id;
    User.findById(id).populate('roles').populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '用户不存在'
            });
        }
        
        if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        //系统默认用户不能删除
        if(result.status === 101) {
            return res.render('server/info', {
                message: '不能删除系统默认管理员'
            });
        }
        
        result.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败222'
                });
            }
            //自杀的节奏啊
            if(id === req.session.user._id) {
                req.session.destroy();
                res.locals.User = null;
                console.log('自杀成功');
                var path = core.translateAdminDir('/index');
                return res.redirect(path);
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
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
            if (!user) {
                return res.render('server/info', {
                    message: '登录失败, 查无此人'
                });
            }
            if (user.authenticate(password)) {
                console.log('登录成功');
                console.log(user);
                //记录登录信息
                user.last_login_date = new Date();
                user.last_login_ip = req.ip;
                user.save();
                req.session.user = user;
                var path = core.translateAdminDir('/index');
                res.redirect(path);
            } else {
                res.render('server/info', {
                    message: '密码不正确'
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
        /*res.render('server/info', {
            message: '注销成功'
        });*/
        var path = core.translateAdminDir('/index');
        res.redirect(path);
    } else {
        res.render('server/info', {
            message: '注销失败'
        });
    }
};
//找回密码
exports.forget = function(req, res) {
    if(req.method === 'GET') {
        var hash = req.query.hash;
        if(!hash) {
            return res.render('server/user/forget');
        }
        User.findOne({'forget.hash': hash}, function(err, user) {
            console.log(err, user);
            if(err || !user) {
                return res.render('server/info', {
                    message: 'hash错误'
                });
            }
            var till = user.forget.till;
            //检查hash有没有过期
            if(!till || till.getTime() + config.findPasswordTill < Date.now()) {
                return res.render('server/info', {
                    message: 'hash已过期，请重新找回密码'
                });
            }else {
                res.render('server/user/forget', {
                    type: 'set',
                    hash: hash,
                    user: user
                });
            }
        });
        
    } else if(req.method === 'POST') {
        console.log(req.query);
        if(req.query.hash) {
            var obj = req.body;
            var hash = req.query.hash;
            //处理更新密码操作，并重置hash
            User.findOne({'forget.hash': hash}, function(err, user) {
                console.log(err, user);
                if(err || !user) {
                    return res.render('server/info', {
                        message: '初始后：token已过期，请重新找回密码'
                    });
                }
                var till = user.forget.till;
                //console.log(till.getTime(), Date.now());
                if(!till || till.getTime() + config.findPasswordTill < Date.now()) {
                    return res.render('server/info', {
                        message: 'token已过期，请重新找回密码'
                    });
                }else {
                    console.log('可以重新设置密码');
                    user.password = obj.password;
                    user.forget.hash = '';
                    user.forget.till = 0;
                    user.save(function(err, result) {
                        res.render('server/info', {
                            message: '重置密码成功'
                        });
                    });
                }
            });
            return;
        }
        var obj = req.body;
        User.findOne({username: obj.username}, function(err, user) {
            console.log(user);
            if(err || !user) {
                return res.render('server/info', {
                    message: '没有这个用户'
                });
            }
            var hash = crypto.random();
            user.forget = {
                hash: hash,
                till: new Date()
            };
            user.save(function(err, result) {
                console.log(result);
                if(err || !result) {
                    return res.render('server/info', {
                        message: '出错了 '
                    });
                }
                //发邮件操作
                var transporter = nodemailer.createTransport(config.mail.options);
                var url = req.headers.origin + req.originalUrl + '?hash=' + hash;
                transporter.sendMail({
                    from: config.mail.from,
                    to: user.email,
                    subject: '找回密码',
                    html: '你好，请点击<a href="' + url + '">此处</a>找回密码<br/>' + url
                }, function(err, info) {
                    console.log(err, info)
                });
                res.render('server/info', {
                    message: '已邮件发到您的邮箱 ' + user.email.replace(/^([\s\S])(.+)([\s\S])(@.+)/, '$1****$3$4')
                });
            });
            
        });
        
    }
}

//修改密码
exports.changePassword = function(req, res) {
    var obj = req.body;
    User.findById(obj.id, function(err, user) {
        user.password = obj.password;
        user.save(function(err, result) {
            res.render('server/info', {
                message: '修改密码成功'
            });
            console.log('修改密码成功', result);
        })
    });
};