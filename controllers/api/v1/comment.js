'use strict';

let _ = require('lodash');
let mongoose = require('mongoose');
let xss = require('xss');
let core = require('../../../libs/core');
let CommentService = require('../../../services/comment');
let ContentService = require('../../../services/content');
let commentService = new CommentService();
let contentService = new ContentService();

exports.all = async function(req, res) {
    let condition = {}
    let pageInfo = {}
    let data = null
    let error
    try {
        let total = await commentService.count(condition)
        //分页
        pageInfo = core.createPage(req.query.page, total);

        data = await commentService.find(condition, null, {
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        })
        data = data.map((item) => {
            return _.pick(item, '_id', 'content', 'from', 'reply', 'name', 'email', 'website', 'comments')
        })
    } catch (e) {
        // error = e.message
        error = '系统异常'
    }
    
    res.json({
        success: !error,
        data: data,
        error: error,
        pageInfo: pageInfo
    });
};
exports.show = async function(req, res) {
    let id = req.params.id;
    let data = null
    let error
    try {
        data = await commentService.findById(id)
    } catch (e) {
        // error = e.message
        error = '系统异常'
    }
    
    res.json({
        success: !error,
        data: data,
        error: error
    });
}

exports.create = async function(req, res) {
    let body = req.body;
    // console.log(body);
    if (!body.from) {
        return res.json({
            success: false,
            data: null,
            error: 'from参数不存在'
        });
    }
    let obj = _.pick(body, 'content', 'from', 'reply', 'name', 'email', 'website');
    obj.ip = core.getIp(req);
    obj.content = xss(obj.content);

    let user = req.user
    if (user) {
        obj.author = mongoose.Types.ObjectId(user._id)
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
        data = _.assign({}, _.pick(saveResult, 'id', 'content', 'created', 'name', 'email', 'reply', 'from', 'ip'));
    } catch (e) {
        // console.log(e);
        error = e.message;
    }
    res.json({
        success: !error,
        data: data,
        error: error
    });
}

exports.update = async function(req, res) {
    let id = req.params.id
    // let obj = req.body
    let obj = _.pick(req.body, 'content', 'name', 'email', 'website');
    // TODO： 校验输入
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await commentService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = await commentService.findByIdAndUpdate(id, obj, {new: true})
        }
        
    } catch (e) {
        // error = e.message
        error = '系统异常'
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })
}

exports.destroy = async function(req, res) {
    let id = req.params.id
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await commentService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = commentService.findByIdAndRemove(id)
        }
    } catch (e) {
        // error = e.message
        error = '系统异常'
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })
}