'use strict';

let  mongoose = require('mongoose')
let Page = mongoose.model('Page')
let config = require('../../config')
let core = require('../../libs/core')

//列表
exports.list = function(req, res) {
    let condition = {};
    /*if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }*/
    Page.count(condition, function(err, total) {
        let query = Page.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('app/page/list', {
                //title: '列表',
                pages: results,
                pageInfo: pageInfo
            });
        })
    })
};

//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Page.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('app/info', {
                message: '该留言不存在'
            });
        }
        res.render('app/page/item', {
            title: result.title,
            page: result
        });
    });
};