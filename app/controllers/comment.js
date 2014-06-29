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
        obj.ip = req.ip;
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
                if(!content.comments) {
                    content.comments = [];
                }
                content.comments.push(result._id);
                content.save();
                /*res.render('app/message', {
                    msg: '添加成功',
                    data: result
                });*/
                res.json({
                    success: true,
                    msg: '评论成功',
                    data: result
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

exports.list = function(req, res) {
    var condition = {};
    Comment.count(condition, function(err, total) {
        var query = Comment.find({}).populate('author').populate('from');
        //分页
        var pageInfo = util.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            res.render('app/comment', {
                comments: results,
                pageInfo: pageInfo
            });
        })
    })
    /*Comment.find({}).populate('author').exec(function(err, results) {
        //console.log(results);
        res.render('app/comment', {
            comments: results
        });
    })*/
}