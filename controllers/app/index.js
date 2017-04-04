'use strict';

let  mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Message = mongoose.model('Message')
let Category = mongoose.model('Category')
let File = mongoose.model('File')
let config = require('../../config')
let core = require('../../libs/core')

exports.index = function(req, res) {
    console.log('前台')
    //console.time('content-list');
    let condition = {};
    let category = req.query.category;
    if(category) {
        condition.category = category;
    }
    let key = req.query.key;
    if(key) {
        console.log('关键字为', key);
        let _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
        let k = '[^\s]*' + _key + '[^\s]*';
        let reg = new RegExp(k, 'gi');
        condition.title = reg;
    }
    let obj = {};
    Content.count(condition).exec().then(function(total){
        obj.total = total;
        return Content.find().limit(10).sort({created: -1}).exec();
    }).then(function(newest) {
        obj.newest = newest;
        return Content.find().limit(10).sort({visits: -1}).exec();
    }).then(function(hotest) {
        obj.hotest = hotest;
        let query = Content.find(condition).populate('author', 'username name email').populate('comments').populate('gallery');
        //分页
        let pageInfo = core.createPage(req.query.page, obj.total);
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
        let obj = req.body;
        obj.ip = core.getIp(req);
        let contact = new Message(obj);
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