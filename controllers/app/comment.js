'use strict';
let mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Comment = mongoose.model('Comment')
let gravatar = require('gravatar')
let config = require('../../config')
let _ = require('lodash')
let core = require('../../libs/core')

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        obj.ip = core.getIp(req);
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        Content.findById(obj.from, function(err, content) {
            var comment = new Comment(obj);
            comment.save(function(err, result) {
                if(err || !result) {
                    return res.json({
                        success: false,
                        message: '出错啦'
                    });
                }
                if(!content.comments) {
                    content.comments = [];
                }
                content.comments.push(result._id);
                content.save();
                if(obj.reply) {
                    Comment.findById(obj.reply, function(err, comment) {
                        if(!comment.comments) {
                            comment.comments = [];
                        }
                        comment.comments.push(result._id);
                        comment.save();
                    });
                }
                var json = _.assign({}, _.pick(result, 'id', 'content', 'created', 'name', 'email', 'reply', 'from', 'ip'), {
                    avatar: gravatar.url(result.email || '', {s: '40',r: 'x',d: 'retro'}, true)
                });
                res.json({
                    success: true,
                    message: '评论成功',
                    data: json
                });
            });
        });
        
    }
};
//删除
exports.del = function(req, res) {
    if(!req.session.user) {
        return res.render('app/info', {
            message: '请先登录'
        });
    }
    
};
//删除
exports.one = function(req, res) {
    if(!req.session.user) {
        return res.render('app/info', {
            message: '请先登录'
        });
    }
    
};

exports.list = function(req, res) {
    var condition = {};
    Comment.count(condition, function(err, total) {
        var query = Comment.find({}).populate('author').populate('from');
        //分页
        var pageInfo = core.createPage(req, total, 10);
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