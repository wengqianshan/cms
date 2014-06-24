'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Comment = mongoose.model('Comment'),
    config = require('../../config'),
    util = require('../../server/libs/util');
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        Content.findById(obj.from, function(err, content) {
            
            var comment = new Comment(obj);
            comment.save(function(err, result) {
                if(err || !result) {
                    return res.render('app/message', {
                        msg: '添加失败'
                    });
                }
                /*if(!content.comments) {
                    content.comments = [];
                }
                content.update({
                    comments: [result._id]
                });*/
                res.render('app/message', {
                    msg: '添加成功'
                });
            });
        });
        
    }
};
//删除
exports.del = function(req, res) {
    if(!req.session.user) {
        return res.render('message', {
            msg: '请先登录'
        });
    }
    
};
//删除
exports.one = function(req, res) {
    if(!req.session.user) {
        return res.render('message', {
            msg: '请先登录'
        });
    }
    
};