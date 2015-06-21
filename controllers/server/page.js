'use strict';
var mongoose = require('mongoose'),
    Page = mongoose.model('Page'),
    core = require('../../libs/core');
//列表
exports.list = function(req, res) {
    var condition = {};
    /*if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }*/
    Page.count(condition, function(err, total) {
        var query = Page.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/page/list', {
                //title: '列表',
                pages: results,
                pageInfo: pageInfo
            });
        })
    })
};

//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Page.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该页面不存在'
            });
        }
        res.render('server/page/item', {
            title: result.title,
            page: result
        });
    });
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Page.findById(id).exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '留言不存在'
            });
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        console.log(result)
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                });
            }
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

//发送
exports.add = function(req, res) {
    var obj = req.body;
    var page = new Page(obj);
    page.save(function(err) {
        if (err) {
            /*return res.render('server/info', {
                message: '发送失败'
            });*/
            console.log(err);
            return res.json({
                message: '创建失败'
            })
        }
        /*return res.render('server/info', {
            message: '发送成功'
        });*/
        return res.json({
            message: '创建成功'
        })
    });
};