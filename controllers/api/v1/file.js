'use strict';
var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    _ = require('underscore'),
    core = require('../../../libs/core');
exports.list = function(req, res) {
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
            res.jsonp({
                data: results,
                pageInfo: pageInfo
            });
        });
    });
    //
};
exports.item = function(req, res) {
    File.findById(req.param('id'), function(err, result) {
        res.jsonp({
            data: result
        });
    })
}