'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let _ = require('lodash')
let core = require('../../../libs/core')

exports.list = function(req, res) {
    let condition = {};
    let obj = {};
    User.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        let query = User.find(condition);
        //分页
        let pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            let data = results.map(function(item) {
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
    let id = req.param('id');
    User.findById(id).populate('author', 'name created birthday').populate('roles', 'name').exec(function(err, result) {
        let data = _.pick(result, '_id', 'name', 'author', 'created', 'roles', 'birthday')
        res.jsonp({
            data: data
        });
    });
}