'use strict';

let mongoose = require('mongoose')
let ContentService = require('../../services/content')
let contentService = new ContentService()
let CommentService = require('../../services/comment')
let commentService = new CommentService()
let gravatar = require('gravatar')
let config = require('../../config')
let _ = require('lodash')
let xss = require('xss')
let core = require('../../libs/core')

//添加
exports.add = async function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'content', 'from', 'reply', 'name', 'email', 'website');
        obj.ip = core.getIp(req);
        obj.content = xss(obj.content)
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        let data;
        let error;
        try {
            let postItem = await contentService.findById(obj.from);
            let saveResult = await commentService.create(obj);
            if (!postItem.comments) {
                postItem.comments = [];
            }
            if (saveResult._id) {
                postItem.comments.push(saveResult._id);
                postItem.save();
            }

            if (obj.reply) {
                let parent = await commentService.findById(obj.reply);
                if (!parent.comments) {
                    parent.comments = [];
                }
                if (saveResult._id) {
                    parent.comments.push(saveResult._id);
                    parent.save();
                }
            }
            data = _.assign({}, _.pick(saveResult, 'id', 'content', 'created', 'name', 'email', 'reply', 'from', 'ip'), {
                avatar: gravatar.url(saveResult.email || '', { s: '40', r: 'x', d: 'retro' }, true)
            });
        } catch (e) {
            console.log(e);
            error = e.message;
        }
        res.json({
            success: !error,
            message: error,
            data: data
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
    let condition = {};
    Comment.count(condition, function(err, total) {
        let query = Comment.find({}).populate('author').populate('from');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
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
}