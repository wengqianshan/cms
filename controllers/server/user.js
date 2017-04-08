'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let Role = mongoose.model('Role')
let Log = mongoose.model('Log')
let config = require('../../config')
let core = require('../../libs/core')
let crypto = require('../../libs/crypto')
let sendmail = require('sendmail')()
    //nodemailer = require('nodemailer')
    //smtpTransport = require('nodemailer-smtp-transport')
let _ = require('lodash');


/*let userService = require('../../services/user')
userService.findById('53b6ca419dfe0cf41ccbaf96', ['roles', 'author']).then(function(res) {
    console.log(res)
}, function(err) {
    console.log(err)
})*/
// 这个最好移到app.js里面，每次开启服务时检查，
exports.checkInstall = function(req, res, next) {
    if(req.session.user) {
        let path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    User.find({}, function(err, results) {
        if(err) {
            return;
        }
        if(results.length > 0) {
            // let path = core.translateAdminDir('/user/login');
            // return res.redirect(path);
            return next();
        } else {
            //let path = core.translateAdminDir('/install');
            //return res.redirect(path);
            let path = core.translateAdminDir('/install')
            return res.render('server/install')
            //return res.send('请先<a href="' + path + '">安装应用</a>');
        }
    })
}

/*let user = new User({
    username: 'geo5',
    password: '123456',
    name: '测试位置5',
    email: 'geo_5@wenglou.com',
    position: [113.323571, 23.146439]
});
user.save(function(err, result) {
    console.log(result);
    
});*/
/*User.find({'position': {$near: [113.323571, 23.146439]}}).exec(function(err, res) {
    console.log(res);
})*/
/*User.find({'position': {
    $geoWithin: {
        $centerSphere: [
            [113.323571, 23.146439], .0000000000000005
        ]
    }
}}).exec(function(err, res) {
    console.log(res);
})*/

//用户登录校验
exports.authenticate = function(req, res, next) {
    if (!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    } else {
        next();
    }
};
//用户列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    User.count(condition, function(err, total) {
        let query = User.find(condition).populate('author').populate('roles');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
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
    let id = req.param('id');
    User.findById(id).populate('author').populate('roles').exec(function(err, result) {
        res.render('server/user/item', {
            user: result
        });
    });
};
//查询
exports.query = function(req, res) {
    let kw = req.query.q;
    User.find({username: new RegExp(kw, 'gi')}).exec(function(err, result) {
        console.log(err, result)
        if (err) {
            return res.json({
                status: false,
                message: '查询失败'
            });
        }
        return res.json({
            status: true,
            items: result
        });
    });
};
//注册
exports.register = function(req, res) {
    let method = req.method;
    if (method === 'GET') {
        res.render('server/user/register', {});
    } else if (method === 'POST') {
        let obj = req.body;
        obj.reg_ip = core.getIp(req);
        console.log(obj);
        let operator = function() {
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
                
                let user = new User(obj);
                user.save(function(err, result) {
                    console.log(result);
                    // 日志
                    try {
                        new Log({
                            type: 'user',
                            action: 'register',
                            status: !err ? 'success' : 'failed',
                            message: JSON.stringify(_.pick(obj, 'username', 'name', 'email', 'reg_ip')) + '\n' + err
                        }).save()
                    } catch (e) {}
                    if (err) {
                        console.log(err);
                        let errors = err.errors;
                        let message = [];
                        for (let i in errors) {
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

        if (config.stopForumSpam) {
            core.stopForumSpam({
                email: obj.email
            }).then((data) => {
                console.log(data, 'res')
                if (data && data.email && data.email.frequency > 5) {
                    res.render('server/info', {
                        message: '该邮箱已被标记垃圾邮箱，不允许注册'
                    });
                    // 日志
                    try {
                        new Log({
                            type: 'user',
                            action: 'register',
                            status: 'spam',
                            message: JSON.stringify(_.pick(obj, 'username', 'name', 'email', 'reg_ip')) + '\n stopforumspam'
                        }).save()
                    } catch (e) {}
                } else {
                    operator()
                }
            }, (err) => {
                //console.log(err, 'err')
                operator()
            })
        } else {
            operator()
        }

    }
};
//添加
exports.add = function(req, res) {
    let method = req.method;
    if (method === 'GET') {
        res.render('server/user/add', {
            Menu: 'add'
        });
    } else if (method === 'POST') {
        let obj = req.body;
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
            let user = new User(obj);
            user.save(function(err, result) {
                console.log(result);
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
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
    let id = req.params.id;
    let editHandler = function(user) {
        user.save(function(err, user) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
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
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            try{
                let condition = {};
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
        let obj = req.body;
        //判断是否允许编辑
        User.findById(id).populate('roles').populate('author').exec(function(err, user) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = user.author && ((user.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            //let roles = core.getRoles(user);
            let oldRoles = core.getRoles(user);
            //啊 这个人是管你员
            let query;
            if(typeof obj.roles === 'string') {
                query = Role.find({_id: obj.roles});
            } else if(typeof obj.roles === 'object') {
                query = Role.find({_id: {$in: obj.roles}})    
            }
            if(!query) {
                return res.render('server/info', {
                    message: '请至少选择一个角色'
                });
            }
            query.exec(function(err, roles) {
                //系统默认管理员
                if(user.status === 101) {
                    // TODO: 验证
                    let statuses = _.map(roles, 'status');
                    if(statuses.indexOf(201) === -1) {
                        return res.render('server/info', {
                            message: '系统管理员角色不正确'
                        });
                    }
                }
                obj.roles = roles;
                _.assign(user, obj);
                editHandler(user);
            });
        });
    }
};

//删除
exports.del = function(req, res) {
    let deleteHandle = function(user) {
        user.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败'
                });
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    };
    let id = req.params.id;
    User.findById(id).populate('roles').populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '用户不存在'
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
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
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if(err) {
                return res.render('server/info', {
                    message: '删除失败'
                });
            }
            //自杀的节奏啊
            if(id === req.session.user._id) {
                req.session.destroy();
                res.locals.User = null;
                console.log('自杀成功');
                let path = core.translateAdminDir('');
                return res.redirect(path);
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    });
}


let noRedirect = [
    'user/login',
    'user/forget',
    'user/register'
]
//登录
exports.login = function(req, res) {
    if (req.method === 'GET') {
        req.session.loginReferer = req.headers.referer; 
        res.render('server/user/login');
    } else if (req.method === 'POST') {
        let username = req.body.username;
        let password = req.body.password;
        User.findOne({
            username: username
        }).populate('roles').exec(function(err, user) {

            try{
                new Log({
                    type: 'user',
                    action: 'login',
                    message: JSON.stringify(username) + '\n' + err
                }).save()
            } catch(e) {}
            
            if (!user) {
                return res.render('server/info', {
                    message: '登录失败'
                });
            }
            if (user.authenticate(password)) {
                console.log('登录成功');
                console.log(user);
                //记录登录信息
                user.last_login_date = new Date();
                user.last_login_ip = core.getIp(req);
                user.save();
                req.session.user = user;
                let path = core.translateAdminDir('/');
                
                let ref = req.session.loginReferer || path;
                for (let i =0, len = noRedirect.length; i < len; i ++) {
                    if (ref.indexOf(noRedirect[i]) > -1) {
                        ref = path;
                        break;
                    }
                }
                res.redirect(ref);
            } else {
                res.render('server/info', {
                    message: '密码错误'
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
        let path = core.translateAdminDir('/');
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
        let hash = req.query.hash;
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
            let till = user.forget.till;
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
            let obj = req.body;
            let hash = req.query.hash;
            //处理更新密码操作，并重置hash
            User.findOne({'forget.hash': hash}, function(err, user) {
                console.log(err, user);
                if(err || !user) {
                    return res.render('server/info', {
                        message: '初始后：token已过期，请重新找回密码'
                    });
                }
                let till = user.forget.till;
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
        let obj = req.body;
        User.findOne({username: obj.username}, function(err, user) {
            console.log(user);
            if(err || !user) {
                return res.render('server/info', {
                    message: '没有这个用户'
                });
            }
            let hash = crypto.random();
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
                //let transporter = nodemailer.createTransport(config.mail.options);
                let url = req.headers.origin + req.originalUrl + '?hash=' + hash;
                /*transporter.sendMail({
                    from: config.mail.from,
                    to: user.email,
                    subject: '找回密码',
                    html: '你好，请点击<a href="' + url + '">此处</a>找回密码<br/>' + url
                }, function(err, info) {
                    console.log(err, info)
                });*/


                sendmail({
                    from: config.mail.from,
                    to: user.email,
                    subject: '找回密码',
                    content: '你好，请点击<a href="' + url + '">此处</a>找回密码<br/>' + url,
                  }, function(err, reply) {
                    let message = '';
                    if (err) {
                        message = '发送失败，请检查是否安装sendmail服务';
                    } else {
                        message = '已邮件发到您的邮箱 ' + user.email.replace(/^([\s\S])(.+)([\s\S])(@.+)/, '$1****$3$4');
                    }
                    //console.log(err && err.stack);
                    //console.dir(reply);
                    res.render('server/info', {
                        message: message
                    });
                });
                
            });
            
        });
        
    }
}

//修改密码
exports.changePassword = function(req, res) {
    let obj = req.body;
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