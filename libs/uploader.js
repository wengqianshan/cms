'use strict';

//上传文件
//用法
// let upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
//todo: use multer https://cnodejs.org/topic/564f32631986c7df7e92b0db
let _ = require('lodash')
let config = require('../config')
let qn = require('qn')

let path = require('path')
let fs = require('fs')
let existsSync = fs.existsSync || path.existsSync
let mkdirp = require('mkdirp')
let nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/

module.exports = function(opts) {
    let options = _.assign({}, config.upload, opts);
    // 检查上传目录是否存在
    function checkExists(dir) {
        fs.exists(dir, function(exists) {
            if (!exists) {
                mkdirp(dir, function(err) {
                    if (err) console.error(err)
                    else console.log("默认目录不存在，已自动创建： [" + dir + "]");
                });
            }
        });
    }
    checkExists(options.tmpDir);
    checkExists(options.uploadDir);
    //已上传的文件防重名
    let nameCountFunc = function(s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    };
    let safeName = function(_name) {
        // Prevent directory traversal and creating hidden system files:
        let name = path.basename(_name).replace(/^\.+/, '');
        // Prevent overwriting existing files:
        while (existsSync(options.uploadDir + '/' + name)) {
            name = name.replace(nameCountRegexp, nameCountFunc);
        }
        return name;
    };
    //构造文件url
    let initUrls = function(host, name) {
        let baseUrl = (options.useSSL ? 'https:' : 'http:') +
            '//' + host + options.uploadUrl;
        let url = baseUrl + encodeURIComponent(name);
        return url;
    };
    let validate = function(file) {
        let error = '';
        if (options.minFileSize && options.minFileSize > file.size) {
            error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < file.size) {
            error = 'File is too big';
        } else if (!options.acceptFileTypes.test(file.name)) {
            error = 'Filetype not allowed';
        }
        return !error;
    };
    //七牛云存储
    let client = null;
    if (options.storage.type === 'qiniu') {
        client = qn.create(options.storage.options);
    }
    let Uploader = {};
    Uploader.delete = function(url, callback) {
        let fileName = path.basename(decodeURIComponent(url))
        console.log('删除文件', url, fileName);
        if (fileName[0] !== '.') {
            if(url.indexOf(options.storage.options.domain) > -1) {
                try {
                    client.delete(fileName, function(err) {
                        callback && callback.call(null, err);            
                    })
                } catch(e) {
                    console.log('删除7牛图片失败', e);
                    callback && callback.call(null, '删除7牛图片失败');
                }
            } else {
                fs.unlink(options.uploadDir + '/' + fileName, function (err) {
                    callback && callback.call(null, err);
                });    
            }
        } else {
            callback && callback.call(null, '文件类型错误');
        }
    };
    Uploader.post = function(req, res, callback) {
        let files = req.files.files;
        let len = files.length;
        if (len < 1) {
            return;
        }
        let result = [];
        //七牛
        if (options.storage.type === 'qiniu') {
            files.forEach(function(file) {
                if (!validate(file)) {
                    fs.unlink(file.path);
                    return;
                }
                client.uploadFile(file.path, function(err, qf) {
                    //console.log(qf);
                    try {
                        fs.unlink(file.path);
                    } catch (e) {
                        console.log(e);
                    }
                    result.push({
                        url: qf.url,
                        md_url: qf.url + '?imageView/1/w/300',
                        sm_url: qf.url + '?imageView/1/w/100',
                        name: file.name,
                        size: file.size,
                        type: file.type
                    });
                    len--;
                    if (len <= 0) {
                        callback.call(null, {
                            files: result
                        });
                    }
                });
            });
        } else {
            //本地上传
            files.forEach(function(file) {
                if (!validate(file)) {
                    fs.unlink(file.path);
                    return;
                }
                let sName = safeName(file.name);
                fs.renameSync(file.path, options.uploadDir + '/' + sName);
                result.push({
                    url: initUrls(req.headers.host, sName),
                    name: sName,
                    size: file.size,
                    type: file.type
                })
            });
            callback.call(null, {
                files: result
            });
        }
    };
    return Uploader;
};