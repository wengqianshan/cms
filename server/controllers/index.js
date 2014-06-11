'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
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
                console.log(req.body);
            }
        }else{
            //
            var path = util.translateAdminDir('/');
            res.redirect(path);
        }
    })
};