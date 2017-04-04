/**
 * 标签服务
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Tag = mongoose.model('Tag');


let baseServices = require('./base')(Tag);

let services = {
    findBySome: function(id, populates) {
        return new Promise(function(resolve, reject) {
            let query = Tag.findById(id)
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