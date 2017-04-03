'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Message = mongoose.model('Message'),
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
    var key = req.query.key;
    if(key) {
        console.log('关键字为', key);
        var _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
        var k = '[^\s]*' + _key + '[^\s]*';
        var reg = new RegExp(k, 'gi');
        condition.title = reg;
    }
    var obj = {};
    Content.count(condition).exec().then(function(total){
        obj.total = total;
        return Content.find().limit(10).sort({created: -1}).exec();
    }).then(function(newest) {
        obj.newest = newest;
        return Content.find().limit(10).sort({visits: -1}).exec();
    }).then(function(hotest) {
        obj.hotest = hotest;
        var query = Content.find(condition).populate('author', 'username name email').populate('comments').populate('gallery');
        //分页
        var pageInfo = core.createPage(req, obj.total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            //console.timeEnd('content-list');
            if(req.xhr) {
                res.json({
                    //title: '网站首页',
                    contents: results,
                    pageInfo: pageInfo,
                    key: key,
                    total: obj.total,
                    newest: obj.newest,
                    hotest: obj.hotest
                });
                return;
            }
            res.render('app/index', {
                //title: '列表',
                //title: '网站首页',
                contents: results,
                pageInfo: pageInfo,
                key: key,
                total: obj.total,
                newest: obj.newest,
                hotest: obj.hotest
            });
        });
    });
    //
};

exports.contact = function(req, res) {
    if(req.method === 'GET') {
        res.render('app/contact', {
            Path: 'contact'
        });
    } else if (req.method === 'POST') {
        var obj = req.body;
        obj.ip = core.getIp(req);
        var contact = new Message(obj);
        contact.save(function(err, result) {
            console.log(err, result);
            if (err) {
                return res.render('app/info', {
                    message: err.message
                });
            } else {
                res.render('app/info', {
                    message: '提交成功'
                });
            }
        })
        
    }
    
}