'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config'),
    qs = require('qs'),
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

//obj to params TODO: 换成qs
exports.stringify = function(obj) {
    /*var arr = [];
    for(var i in obj) {
        arr.push(i + '=' + obj[i]);
    }
    return arr.join('&');*/
    return qs.stringify(obj);
};
//包装admin路径
exports.translateAdminDir = function(p) {
    var newPath = (config.admin.dir ? '/' + config.admin.dir : '') + (p || '');
    return newPath;
};
//分页  params: 当前页, 总条数, 每页条数
exports.createPage = function(req, total, pageSize) {
    var pageSize = pageSize || 10;
    if (!req) {
        console.log('分页参数错误');
        return;
    }
    var query = req.query || {};
    var page = query.page | 0; //强制转化整型
    var totalPage = Math.max(Math.ceil(total / pageSize), 1); //获取总页数,容错
    var currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page; //获取当前页数
    var start = pageSize * (currentPage - 1); //计算开始位置
    return {
        start: start,
        pageSize: pageSize,
        totalPage: totalPage,
        currentPage: currentPage,
        query: query
    };
};

//获取用户的所有角色,去重
exports.getRoles = function(user) {
    var result = [];
    if (user && user.roles) {
        user.roles.forEach(function(role) {
            result.push(role.name);
        });
    }
    return result;
};
//获取用户的所有权限,去重
exports.getActions = function(user) {
    var result = [];
    if (user && user.roles) {
        user.roles.forEach(function(role) {
            result = result.concat(role.actions);
        });
    }
    return _.uniq(result);
};

//获取用户的所有权限,去重
exports.getRoleStatus = function(user) {
    var result = [];
    if (user && user.roles) {
        user.roles.forEach(function(role) {
            result.push(role.status);
        });
    }
    return result;
};

//给字符组后面加上反斜杠，主要应用在目录拼接
exports.prettySlash = function(str) {
    return str.substr(-1) === '/' ? str : str + '/';
};
//根据文件类型输出icon
exports.fileToIcon = function(type) {
    var suffix = '';
    switch (type) {
        case 'text/html':
        case 'text/javascript':
            suffix = '-code-o';
            break;
        case 'application/pdf':
            suffix = '-pdf-o';
            break;
        case 'application/zip':
            suffix = '-zip-o';
            break;
        case 'application/msword':
            suffix = '-word-o';
            break;
        case 'image/png':
        case 'iamge/jpeg':
            suffix = '-photo-o';
            break;
        case 'audio/amr':
            suffix = '-audio-o';
            break;
        case 'video/mp4':
            suffix = '-video-o';
            break;
    }
    return 'fa-file' + suffix;
};
exports.getIp = function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || req.ip;
};