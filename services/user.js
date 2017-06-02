/**
 * 用户服务
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let moment = require('moment')
let config = require('../config');
let core = require('../libs/core');
let User = mongoose.model('User');
let RoleService = require('./role');


let baseServices = require('./base')(User);

let services = {
    login: function(id, populates) {
        return new Promise(function(resolve, reject) {
            
        })
    },
    register: function(obj) {
        return new Promise(function(resolve, reject) {
            if (!obj) {
                return reject(null)
            }
            //默认角色
            RoleService.read({status: 202}, function(err, role) {
                console.log('role', role);
                if(err || !role) {
                    console.log('注册失败, 未开放角色:' + config.admin.role.user)
                }
                obj.roles = [role._id];
                obj.reg_ip = core.getIp(req);
                let user = new User(obj);
                user.save(function(err, result) {
                    console.log(result);
                    if (err) {
                        console.log(err);
                    
                    } else {
                        console.log('注册成功')
                    }
                    
                });
            });
        })
    },
    trend: function() {
        let now = new Date()
        let lastMonth = moment().subtract(3, 'month').format()
        return new Promise(function(resolve, reject) {
            User.aggregate({
                $match: {
                    created: {'$gt': new Date(lastMonth)}
                }
            }, {
                $project: {
                    d: {$add: ['$created', 28800000]}
                }
            }, {
                $project: {
                    day: {$dateToString: {format: '%Y-%m-%d', date: '$d'}}
                }
            }, {
                $group: {
                    _id: '$day',
                    total: {$sum: 1}
                }
            }, {
                $sort: {
                    _id: -1
                }
            }).exec((err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    }
};

module.exports = _.assign({}, baseServices, services);
