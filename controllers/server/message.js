'use strict';
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    core = require('../../libs/core');
//列表
exports.list = function(req, res) {
    var condition = {};
    /*if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }*/
    Message.count(condition, function(err, total) {
        var query = Message.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/message/list', {
                //title: '列表',
                messages: results,
                pageInfo: pageInfo
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Message.findById(id).exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该留言不存在'
            });
        }
        res.render('server/message/item', {
            title: result.name + '的留言',
            message: result
        });
    });
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Message.findById(id).exec(function(err, result) {
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