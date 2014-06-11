'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    config = require('../../config'),
    util = require('../libs/util');
var userController = require('../../server/controllers/user');

//后台首页
exports.index = function(req, res, next) {
    if(req.session.user) {
        res.render('server/index', { title: 'CMS系统' });
        var roles = userController.getRoles(req.session.user);
        var actions = userController.getActions(req.session.user);
    }
};
//管理员资料
exports.me = function(req, res) {
    var id = req.session.user._id;
    User.findById(id).populate('roles').exec(function(err, user) {
        user._roles = userController.getRoles(req.session.user);;
        user._actions = userController.getActions(req.session.user);
        res.render('server/me', {
            title: '我的资料',
            user: user
        });
    }); 
};

//初始化后台,安装初始数据
exports.install = function(req, res) {
    if(req.session.user) {
        var path = util.translateAdminDir('/');
        return res.redirect(path);
    }
    //检查是否已经有用户
    User.find({}, function(err, results) {
        console.log(err, results);
        if(err) {
            return;
        }
        if(results.length < 1) {
            //满足条件
            if(req.method === 'GET') {
                res.render('server/install', {
                    title: '初始化'
                });
            } else if(req.method === 'POST') {
                var createUser = function(obj) {
                    var user = new User(obj);
                    user.save(function() {
                        res.render('server/message', {
                            msg: '初始化完成'
                        });
                    });
                };
                var obj = req.body;
                //检查是否有角色，没有的话创建
                Role.find({name: 'admin'}, function(err, roles) {
                    console.log('查找role', err, roles)
                    if(roles.length < 1) {
                        console.log('没有角色 admin');
                        var role = new Role({
                            name: 'admin',
                            actions: ['admin']
                        });
                        role.save(function(err, result) {
                            console.log('role result', result);
                            obj.roles = [role._id];
                            createUser(obj);
                        });
                        //创建普通角色
                        new Role({
                            name: 'public',
                            actions: ['read']
                        }).save();
                    }else{
                        createUser(obj);
                    }
                })
            }
        }else{
            //已经初始化过，跳过
            var path = util.translateAdminDir('/');
            res.redirect(path);
        }
    })
};