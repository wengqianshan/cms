'use strict';
var mongoose = require('mongoose'),
    Tag = mongoose.model('Tag'),
    _ = require('underscore'),
    core = require('../../libs/core');
//列表
exports.list = function(req, res) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Tag.count(condition, function(err, total) {
        var query = Tag.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/tag/list', {
                //title: '列表',
                tags: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Tag.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该分类不存在'
            });
        }
        res.render('server/tag/item', {
            title: result.name,
            tag: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/tag/add', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var tag = new Tag(obj);
        tag.save(function(err, tag) {
            if (err) {
                return res.render('server/info', {
                    message: '创建失败'
                });
            }
            res.render('server/info', {
                message: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Tag.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            res.render('server/tag/edit', {
                tag: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        Tag.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.extend(result, obj);
            result.save(function(err, tag) {
                if(!err) {
                    res.render('server/info', {
                        message: '更新成功'
                    });
                }
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Tag.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '分类不存在'
            });
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        result.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败222'
                });
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    });
};