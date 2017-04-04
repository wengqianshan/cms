/**
 * 分类服务
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Category = mongoose.model('Category');


let baseServices = require('./base')(Category);

let services = {
    findBySome: function(id, populates) {
        return new Promise(function(resolve, reject) {
            let query = Category.findById(id)
            if (populates && populates.length > 0) {
                populates.forEach(function(item) {
                    query = query.populate(item);
                })
            }
            query.exec(function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            });
        })
    }
};

module.exports = _.assign({}, baseServices, services);