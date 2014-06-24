'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    _ = require('underscore'),
    util = require('../../server/libs/util');

//列表
exports.list = function(req, res) {
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
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
            res.render('app/content/list', {
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
    Content.findById(id).populate('author', 'username name email').populate('category').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('app/message', {
                msg: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('app/content/item', {
            title: result.title,
            content: result
        });
    });
};