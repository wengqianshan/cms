'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../../config');

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
    var newPath = (config.admin.dir ? '/' + config.admin.dir : '') + path;
    return newPath;
};
