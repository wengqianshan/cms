'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    _ = require('underscore'),
    util = require('../libs/util');

//列表
exports.list = function(req, res) {
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
    }
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    //查数据总数
    Content.count(condition, function(err, total) {
        var query = Content.find(condition).populate('author', 'username name email');
        //分页
        var pageInfo = util.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/content/list', {
                title: '内容列表',
                contents: results,
                pageInfo: pageInfo
            });
        });
    });
    
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Content.findById(id).populate('author', 'username name email').populate('category').populate('comments').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/message', {
                msg: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('server/content/item', {
            title: result.title,
            content: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        var condition = {};
        if(req.Roles && req.Roles.indexOf('admin') < 0) {
            condition.author = req.session.user._id;
        }
        Category.find(condition, function(err, results) {
            res.render('server/content/add', {
                categorys: results
            });
        });
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if(obj.category === '') {
            obj.category = null;
        }
        var content = new Content(obj);
        content.save(function(err, content) {
            if (err) {
                console.log(err);
                return res.render('server/message', {
                    msg: '创建失败'
                });
            }
            res.render('server/message', {
                msg: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Content.findById(id, function(err, result) {
            if(err) {
                console.log('加载内容失败');
            }
            var condition = {};
            if(req.Roles && req.Roles.indexOf('admin') < 0) {
                condition.author = req.session.user._id;
            }
            Category.find(condition, function(err, categorys) {
                res.render('server/content/edit', {
                    content: result,
                    categorys: categorys
                });
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        if(obj.category === '') {
            obj.category = null;
        }
        Content.findByIdAndUpdate(id, obj, function(err, result) {
            console.log(err, result);
            if(!err) {
                res.render('server/message', {
                    msg: '更新成功'
                });
            }
        })
    }
};
//删除
exports.del = function(req, res) {
    if(!req.session.user) {
        return res.render('server/message', {
            msg: '请先登录'
        });
    }
    var id = req.params.id;
    Content.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/message', {
                msg: '内容不存在'
            });
        }
        //
        //if(!result.author || result.author._id == req.session.user._id) {
            result.remove(function(err) {
                if(err) {
                    return res.render('server/message', {
                        msg: '删除失败'
                    });
                }
                res.render('server/message', {
                    msg: '删除成功'
                })
            });
        /*}else {
            return res.render('server/message', {
                msg: '你没有权限删除别人的文章'
            });
        }*/
    });
};