'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    File = mongoose.model('File'),
    config = require('../../config'),
    _ = require('underscore'),
    core = require('../../libs/core');
exports.index = function(req, res) {
    console.log('前台')
    //console.time('content-list');
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
    }
    Content.count(condition, function(err, total) {
        var query = Content.find(condition).populate('author', 'username name email').populate('comments');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            //console.timeEnd('content-list');
            res.render('app/index', {
                //title: '列表',
                title: '网站首页',
                contents: results,
                pageInfo: pageInfo
            });
        })
    });
    
};