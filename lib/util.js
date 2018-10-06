'use strict';

let fs = require('fs')
let path = require('path')
let config = require('../config')
let qs = require('qs')
let _ = require('lodash')
let axios = require('axios')

// recursively walk modules path and callback for each file
let walk = function (modulesPath, excludeDir, callback) {
  fs.readdirSync(modulesPath).forEach(function (file) {
    let newPath = path.join(modulesPath, file);
    let stat = fs.statSync(newPath);
    if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
      callback(newPath);
    } else if (stat.isDirectory() && file !== excludeDir) {
      walk(newPath, excludeDir, callback);
    }
  });
};
exports.walk = walk;

exports.stringify = function (obj) {
  return qs.stringify(obj);
};
//包装admin路径
exports.translateAdminDir = function (p) {
  let newPath = (config.admin.dir ? '/' + config.admin.dir : '') + (p || '');
  return newPath;
};
//分页  params: 当前页, 总条数, 每页条数
exports.createPage = function (page = 0, total = 0, pageSize = 20) {
  let totalPage = Math.max(Math.ceil(total / pageSize), 1); //获取总页数
  let currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page; //获取当前页数
  let start = pageSize * (currentPage - 1); //计算开始位置
  return {
    start: start,
    pageSize: pageSize,
    totalPage: totalPage,
    currentPage: currentPage
  };
};

//获取用户的所有角色,去重
exports.getRoles = function (user) {
  let result = [];
  if (user && user.roles) {
    user.roles.forEach(function (role) {
      result.push(role._id + '');
    });
  }
  return result;
};
//获取用户的所有权限,去重
exports.getActions = function (user) {
  let result = [];
  if (user && user.roles) {
    user.roles.forEach(function (role) {
      result = result.concat(role.actions);
    });
  }
  return _.uniq(result);
};

//获取用户的所有权限,去重
exports.getRoleStatus = function (user) {
  let result = [];
  if (user && user.roles) {
    user.roles.forEach(function (role) {
      result.push(role.status);
    });
  }
  return result;
};

//给字符组后面加上斜杠，主要应用在目录拼接
exports.prettySlash = function (str) {
  return str.substr(-1) === '/' ? str : str + '/';
};
//根据文件类型输出icon
exports.fileToIcon = function (type) {
  let suffix = '';
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
exports.getIp = function (req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || req.ip;
};

exports.stopForumSpam = function (obj = {}) {
  return new Promise((resolve, reject) => {
    axios('http://api.stopforumspam.org/api?json', {
      params: {
        username: obj.username,
        email: obj.email,
        ip: obj.ip
      }
    }).then((res) => {
      resolve(res.data)
    }).catch((error) => {
      reject(error)
    })
  })

}
