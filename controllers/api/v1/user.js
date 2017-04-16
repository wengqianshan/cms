'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let _ = require('lodash')
let core = require('../../../libs/core')

exports.all = function(req, res) {
    let condition = {};
    let obj = {};
    User.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        let query = User.find(condition);
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            let data = results.map(function(item) {
                //return _.pick(item, '_id', 'name', 'created', 'birthday')
                return _.pick(item, '_id' ,'name', 'avatar', 'gender', 'birthday', 'description', 'rank')
            });
            res.jsonp({
                data: data,
                pageInfo: pageInfo
            });
        });
    });
    //
};
exports.show = function(req, res) {
    let id = req.param('id');
    User.findById(id).exec(function(err, result) {
        let data = _.pick(result, 'name', 'avatar', 'gender', 'birthday', 'description', 'rank')
        res.jsonp({
            data: data
        });
    });
}

exports.create = function(req, res) {

}

exports.update = function(req, res) {

}

exports.destroy = function(req, res) {

}