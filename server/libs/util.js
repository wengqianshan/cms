'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../../config'),
    _ = require('underscore');

// recursively walk modules path and callback for each file
var walk = function(modulesPath, excludeDir, callback) {
    fs.readdirSync(modulesPath).forEach(function(file) {
        var newPath = path.join(modulesPath, file);
        var stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
            callback(newPath);
        } else if (stat.isDirectory() && file !== excludeDir) {
	    walk(newPath, excludeDir, callback);
        }
    });
};
exports.walk = walk;

//obj to params
exports.generateParamsByObj = function(obj) {
    var arr = [];
    for(var i in obj) {
        arr.push(i + '=' + obj[i]);
    }
    return arr.join('&');
};
//包装admin路径
exports.translateAdminDir = function(path) {
    var newPath = (config.admin.dir ? '/' + config.admin.dir : '') + (path || '');
    return newPath;
};
//分页  params: 当前页, 总条数, 每页条数
exports.createPage = function(page, total, pageSize, req) {
    var pageSize = pageSize || 10;
    var page = page|0;//强制转化整型
    var totalPage = Math.ceil(total/pageSize);//获取总页数
    var currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page;//获取当前页数
    var start = pageSize * (currentPage - 1);//计算开始位置
    return {
        start: start,
        pageSize: pageSize,
        totalPage: totalPage,
        currentPage: currentPage,
        query: req ? req.query : null
    };
};

//获取用户的所有角色,去重
exports.getRoles = function(user) {
    var result = [];
    if(user && user.roles) {
        user.roles.forEach(function(role) {
            result.push(role.name);
        });
    }
    return result;
};
//获取用户的所有权限,去重
exports.getActions = function(user) {
    var result = [];
    if(user && user.roles) {
        user.roles.forEach(function(role) {
            result = result.concat(role.actions);
        });
    }
    return _.uniq(result);
};