'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Message = mongoose.model('Message'),
    Category = mongoose.model('Category'),
    File = mongoose.model('File'),
    config = require('../../config'),
    _ = require('underscore'),
    core = require('../../libs/core');
exports.list = function(req, res) {
    console.log('前台')
    //console.time('content-list');
    var condition = {};
    var obj = {};
    File.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        var query = File.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            //console.timeEnd('content-list');
            res.jsonp({
                data: results,
                pageInfo: pageInfo
            });
        });
    });
    //
};
exports.one = function(req, res) {
    File.findById(req.param('id'), function(err, result) {
        res.jsonp({
            data: result
        });
    })
}