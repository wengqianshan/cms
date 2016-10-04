/**
 * 留言服务
 **/
'use strict';
var mongoose = require('mongoose');
var _ = require('underscore');
var Message = mongoose.model('Message');


var baseServices = require('./base')(Message);

var services = {
    findBySome: function(id, populates) {
        return new Promise(function(resolve, reject) {
            var query = Message.findById(id)
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

module.exports = _.extend({}, baseServices, services);