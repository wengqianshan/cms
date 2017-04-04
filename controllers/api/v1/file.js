'use strict';

let mongoose = require('mongoose')
let File = mongoose.model('File')
let core = require('../../../libs/core')

exports.list = function(req, res) {
    let condition = {};
    let obj = {};
    File.count(condition).exec().then(function(total){
        return total;
    }).then(function(total) {
        let query = File.find(condition);
        //分页
        let pageInfo = core.createPage(req.query.page, total);
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