'use strict';
var mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    _ = require('underscore'),
    core = require('../../libs/core');


/*error: 
message:
otherObj:*/
//列表
exports.list = function(req, res, callback) {
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Category.count(condition, function(err, total) {
        var query = Category.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            callback.call(null, {
                error: err,
                message: '',
                categorys: results,
                pageInfo: pageInfo
            });
        })
    })
    
};
//单条
exports.one = function(req, res, callback) {
    var id = req.param('id');
    Category.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        callback.call(null, {
            error: err,
            message: '',
            category: result
        });
    });
};
//添加
exports.add = function(req, res, callback) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var category = new Category(obj);
        category.save(function(err, category) {
            callback.call(null, {
                error: err,
                message: '',
                category: category
            });
        });
    }
};
exports.edit = function(req, res, callback) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Category.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return callback.call(null, {
                    error: true,
                    message: '没有权限'
                });
            }
            callback.call(null, {
                error: err,
                message: '',
                category: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        Category.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return callback.call(null, {
                    error: true,
                    message: '没有权限',
                });
            }
            _.extend(result, obj);
            result.save(function(err, category) {
                callback.call(null, {
                    error: err,
                    message: '',
                    category: category
                });
            });
        });
    }
};
//删除
exports.del = function(req, res, callback) {
    var id = req.params.id;
    Category.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return callback.call(null, {
                error: true,
                message: '分类不存在',
            });
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
            return callback.call(null, {
                success: false,
                msg: '没有权限'
            });
        }
        result.remove(function(err) {
            return callback.call(null, {
                error: err,
                message: '删除成功',
            });
        });
    });
};