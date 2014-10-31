'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    userController = require('./user'),
    _ = require('underscore'),
    config = require('../../config'),
    core = require('../../libs/core');

//管理员资料
exports.init = function(req, res) {
    var id = req.session.user._id;
    User.findById(id).populate('roles').exec(function(err, user) {
        user._roles = req.Roles;
        user._actions = req.Actions;
        res.render('server/me/item', {
            title: '我的资料',
            user: user
        });
    });
};
//修改管理员信息
exports.edit = function(req, res) {
    var id = req.session.user._id;
    if(req.method === 'GET') {
        User.findById(id).populate('roles').exec(function(err, user) {
            user._roles = req.Roles;
            user._actions = req.Actions;
            res.render('server/me/edit', {
                title: '修改资料',
                user: user
            });
        });
    } else if(req.method === 'POST') {
        var obj = req.body;
        User.findById(id).populate('roles').exec(function(err, user) {
            _.extend(user, _.pick(obj, 'name', 'email', 'mobile', 'gender', 'birthday'));
            user.save(function(err, result) {
                console.log(err, result);
                if(err || !result) {
                    return res.render('server/info', {
                        message: '修改失败'
                    });    
                }
                req.session.user = result;
                res.locals.User = user;
                res.render('server/info', {
                    message: '修改成功'
                });
            })
        });
    }
};
//修改密码
exports.updatePassword = function(req, res) {
    if(req.method === 'GET') {

    } else if(req.method === 'POST') {
        var obj = req.body;
        var oldPassword = obj.oldpassword;
        var password = obj.password;
        var id = req.session.user._id;
        User.findById(id).exec(function(err, user) {
            if (user.authenticate(oldPassword)) {
                user.password = password;
                user.save(function(err, result) {
                    //console.log('fffffffffffff', result);
                    userController.reload(result._id, function(err, user) {
                        req.session.user = user;
                        res.locals.User = user;
                        res.render('server/info', {
                            message: '密码修改成功'
                        });
                    });
                    /*req.session.user = result;
                    res.locals.User = result;
                    res.render('server/info', {
                        message: '密码修改成功'
                    });*/
                });
            } else {
                res.render('server/info', {
                    message: '原密码不正确'
                });
            }
        });
    }
};