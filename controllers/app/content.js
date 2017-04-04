'use strict';
let mongoose = require('mongoose')
let Comment = mongoose.model('Comment')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let core = require('../../libs/core')

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
        var pageInfo = core.createPage(req, total, 30);
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
    var nested = req.query.comment_list;
    Content.findById(id).populate('author').populate('category').populate('comments').populate('gallery').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('app/info', {
                message: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();

        res.render('app/content/item', {
            title: result.title,
            content: result,
            comment_list: nested
        });
    });
};