'use strict';
var mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    util = require('../libs/util');
//列表
exports.list = function(req, res) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Category.count(condition, function(err, total) {
        var query = Category.find(condition);
        //分页
        var pageInfo = util.createPage(req.query.page, total, 10, req);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/category/list', {
                //title: '列表',
                categorys: results,
                pageInfo: pageInfo
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Category.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/message', {
                msg: '该内容不存在'
            });
        }
        res.render('server/category/item', {
            title: result.name,
            category: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/category/add');
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var category = new Category(obj);
        category.save(function(err, category) {
            if (err) {
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
        Category.findById(id, function(err, result) {
            res.render('server/category/edit', {
                category: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        Category.findByIdAndUpdate(id, obj, function(err, result) {
            //console.log(err, result);
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
    Category.findById(id, function(err, result) {
        if(!result) {
            return res.render('server/message', {
                msg: '内容不存在'
            });
        }
        if(!result.author || result.author == req.session.user._id) {
            result.remove(function(err) {
                if(err) {
                    return res.render('server/message', {
                        msg: '删除失败222'
                    });
                }
                res.render('server/message', {
                    msg: '删除成功'
                })
            });
        }else {
            return res.render('server/message', {
                msg: '你没有权限删除别人的文章'
            });
        }
    });
};