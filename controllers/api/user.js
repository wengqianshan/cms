'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config'),
    _ = require('underscore'),
    core = require('../../libs/core');
exports.list = function(req, res) {
    console.log('用户')
    //console.time('content-list');
    var condition = {};
    var obj = {};
    User.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        var query = User.find(condition).populate('author').populate('roles');
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
exports.item = function(req, res) {
    var id = req.param('id');
    User.findById(id).populate('author').populate('roles').exec(function(err, result) {
        res.jsonp({
            data: result
        });
    });
}