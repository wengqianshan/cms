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
    }/*else{
        var path = util.translateAdminDir('/user/login');
        res.redirect(path);
    }*/
};

exports.me = function(req, res) {
    var id = req.session.user._id;
    User.findById(id).populate('roles').exec(function(err, user) {
        res.render('server/me', {
            title: '我的资料',
            user: user
        });
    }); 
}