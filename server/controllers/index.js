'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    config = require('../../config'),
    util = require('../libs/util');
var user = require('../../server/controllers/user');

exports.index = function(req, res) {
    if(req.session.user) {
        res.render('server/index', { title: 'CMS系统' });
        /*user.checkRole('admin', req.session.user._id, function(err, user) {
            console.log('校验通过', user);
            res.render('server/index', { title: 'CMS系统' });
        }, function(err) {
            console.log(err);
            res.render('server/message', { msg: '你不是管理员' });
        });*/
    }
};

exports.me = function(req, res) {
    var id = req.session.user._id;
    User.findById(id).populate('roles').exec(function(err, user) {
        res.render('server/me', {
            title: '我的资料',
            user: user
        });
    }); 
};

//初始化后台
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
                console.log(req.body);
            }
        }else{
            //
            var path = util.translateAdminDir('/');
            res.redirect(path);
        }
    })
};