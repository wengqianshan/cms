/**
 * 用户服务
 **/

'use strict';
var mongoose = require('mongoose'),
    _ = require('underscore'),
    config = require('../config'),
    core = require('../libs/core'),
    crypto = require('../libs/crypto'),
    User = mongoose.model('User'),
    RoleService = require('./role');

//获取一组用户
//查询条件, populate(数组), limit, sort, select
// [{
//     path: 'role'
// }]
exports.find = function(condition, populates) {
    var condition = condition || {};
    return new Promise(function(resolve, reject) {
        var query = User.find(condition)
        if (populates && populates.length > 0) {
            populates.forEach(function(item) {
                query = query.populate(item);
            })
        }
        query.exec(function(err, result) {
            console.log(err, result)
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        });
    });
}

exports.findOne = function(condition, populates) {
    
}

//获取单个用户
exports.findById = function(id, populates) {
    return new Promise(function(resolve, reject) {
        var query = User.findById(id)
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
//创建一个用户
exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        var user = new User(obj);
        user.save(function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        });
    })
}


//更新一批用户
exports.update = function(condition, doc, options) {
    return new Promise(function(resolve, reject) {
        User.update(condition, doc, options, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

exports.updateOne = function(condition, doc, options) {
    
}

//更新一个用户
//Model.findByIdAndUpdate(id, { $set: { name: 'jason borne' }}, options, callback)
exports.updateById = function(id, obj, options) {
    return new Promise(function(resolve, reject) {
        User.findByIdAndUpdate(id, obj, options, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        })
    })
}



//删除一批用户
exports.delete = function(condition) {
    return new Promise(function(resolve, reject) {
        User.remove(condition, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

exports.deleteOne = function(condition) {
    
}

//删除一个用户
exports.deleteById = function(id) {
    return new Promise(function(resolve, reject) {
        User.findByIdAndRemove(id, options, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

//登录
exports.login = function() {
    
}

//注册
exports.register = function(obj) {
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
            var user = new User(obj);
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
    
}