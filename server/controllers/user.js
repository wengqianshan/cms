'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role');

exports.authenticate = function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/user/login')
    } else {
        next();
    }
};
//用户列表
exports.list = function(req, res) {
    User.find(function(err, results) {
        res.render('user/list', {
            users: results
        });
    })
}
//单个用户
exports.one = function(req, res) {
    var id = req.param('id');
    User.findById(id, function(err, result) {
        res.render('user/item', {
            user: result
        });
    });
}
//注册
exports.register = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('user/register', {});
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        var user = new User(obj);
        user.save(function(err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                return res.render('message', {
                    msg: '注册失败'
                });
            }
            res.render('message', {
                msg: '注册成功'
            });
        });
    }
};

//编辑
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.params.id;
        User.findById(id, function(err, result) {
            try{
                Role.find(function(err, results) {
                    if(!err && results) {
                        res.render('user/edit', {
                            user: result,
                            roles: results
                        });
                    }
                }) 
            }catch(e) {
               res.render('user/edit', {
                    user: result
                });
            }
        })
    } else if(req.method === 'POST') {
        var id = req.params.id;
        var obj = req.body;
        obj.role = ['5391e2bfa8d2561888dbc301', '5391e8f7a8d2561888dbc302'];
        User.findByIdAndUpdate(id, obj, function(err, result) {
            console.log(err, result);
            if(!err) {
                res.render('message', {
                    msg: '更新成功'
                });
            }
        })
    }
};

//删除
exports.del = function(req, res) {
    /*if(!req.session.user) {
        return res.render('message', {
            msg: '请先登录'
        });
    }*/
    var id = req.params.id;
    User.findById(id, function(err, result) {
        if(!result) {
            return res.render('message', {
                msg: '用户不存在'
            });
        }
        //TODO:判断权限
        //if(result._id == req.session.user._id) {
            result.remove(function(err) {
                if(err) {
                    return res.render('message', {
                        msg: '删除失败222'
                    });
                }
                res.render('message', {
                    msg: '删除成功'
                })
            });
        /*}else {
            return res.render('message', {
                msg: '你没有权限删除这篇文章'
            });
        }*/
    });
}
//登录
exports.login = function(req, res) {
    if (req.method === 'GET') {
        res.render('user/login');
    } else if (req.method === 'POST') {
        var username = req.body.username;
        var password = req.body.password;
        User.findOne({
            username: username
        }).populate('role').exec(function(err, user) {
            //console.log(user.hasRole('admin'));
            //console.log(user.hasAction('read'));
            if (!user) {
                return res.render('message', {
                    msg: '登录失败, 查无此人'
                });
            }
            if (user.authenticate(password)) {
                console.log('登录成功');
                req.session.user = user;
                res.redirect('/');
            } else {
                res.render('message', {
                    msg: '密码不正确'
                });
            }
        });
    }

};

//注销
exports.logout = function(req, res) {
    if (req.session) {
        req.session.destroy();
        res.locals.user = null;
        console.log('注销成功');
        res.render('message', {
            msg: '注销成功'
        });
    } else {
        res.render('message', {
            msg: '注销失败'
        });
    }
};

//更新内容：不包括virtual的数据
exports.update = function(id, obj) {
    User.update({
        username: 'same'
    }, {
        name: '111111'
    }, function(err, results) {
        console.log(err, results)
    })
};
//修改密码
exports.changePassword = function(id, password) {
    User.findById(id, function(err, user) {
        user.password = password;
        user.save(function(err, result) {
            console.log('修改密码成功', result);
        })
    });
}

//删除
exports.remove = function(id) {
    User.findByIdAndRemove(id, function(err, user) {
        console.log(err, user);
    })
};

//查找
exports.find = function(conditions, fields, options) {
    User.find(conditions, fields, function(err, results) {
        console.log(err, results);
    })
};