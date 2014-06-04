'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.authenticate = function(req, res, next) {
    if(!req.session.user) {
        return res.render('message', {
            msg: '未登录'
        });
    }else{
        next();
    }
};
exports.list = function(req, res) {
    User.find(function(err, results) {
        res.render('user/list', {
            users: results
        });
    })
}
exports.add = function(req, res) {
    var method = req.method;
    if(method === 'GET') {
        res.render('user/add', {});
    }else if(method === 'POST') {
        var obj = req.body;
        console.log(obj);
        var user = new User(obj);
        user.save(function(err, result) {
            console.log(result);
            if(err) {
                return console.log('注册失败');
            }
            res.render('message', {
                msg: '注册成功'
            });
        });
    }
}
exports.one = function(req, res) {
    var id = req.param('id');
    User.findById(id, function(err, result) {
        res.render('user/item', {
            user: result
        });
    });
}
//注册
/*exports.register = function(obj) {
    var user = new User(obj);
    user.save(function(err, result) {
        if(err) {
            return console.log('注册失败');
        }
        console.log('注册成功', result);
    });
};*/

//登录
exports.login = function(username, password) {
    User.findOne({username: username}, function(err, user) {
        console.log(err, user);
        if(!user) {
            return console.log('登录失败, 没有该用户');
        }
        if(user.authenticate(password)) {
            console.log('登录成功');
            req.session.user = user;
        }else{
            console.log('密码不正确');
        }
    });
};

//更新内容：不包括virtual的数据
exports.update = function(id, obj) {
    User.update({username: 'same'}, {name: '111111'}, function(err, results) {
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
