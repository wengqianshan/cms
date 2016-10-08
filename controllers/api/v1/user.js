'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('underscore'),
    core = require('../../../libs/core');
exports.list = function(req, res) {
    var condition = {};
    var obj = {};
    User.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        var query = User.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            var data = results.map(function(item) {
                return _.pick(item, '_id', 'name', 'created', 'birthday')
            });
            res.jsonp({
                data: data,
                pageInfo: pageInfo
            });
        });
    });
    //
};
exports.item = function(req, res) {
    var id = req.param('id');
    User.findById(id).populate('author', 'name created birthday').populate('roles', 'name').exec(function(err, result) {
        var data = _.pick(result, '_id', 'name', 'author', 'created', 'roles', 'birthday')
        res.jsonp({
            data: data
        });
    });
}