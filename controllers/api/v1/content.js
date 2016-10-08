'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    _ = require('underscore'),
    core = require('../../../libs/core');
exports.list = function(req, res) {
    console.time('content-list');
    var condition = {};
    var obj = {};
    Content.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        var query = Content.find(condition).populate('author', 'name').populate('category', 'name').populate('gallery', 'url name size type created');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            console.timeEnd('content-list');
            res.jsonp({
                data: results,
                pageInfo: pageInfo
            });
        });
    });
    //
};
exports.item = function(req, res) {
    var query = Content.findById(req.param('id')).populate('author', 'name').populate('category', 'name').populate('gallery', 'url name size type created');
    query.exec(function(err, result) {
        res.jsonp({
            data: result
        });
    })
}