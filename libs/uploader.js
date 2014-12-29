//上传文件
//用法
// var upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
var _ = require('underscore');
var config = require('../config');
var qn = require('qn');
module.exports = function(opts) {
    var path = require('path'),
        fs = require('fs'),
        _existsSync = fs.existsSync || path.existsSync,
        mkdirp = require('mkdirp'),
        nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
        options = _.extend({}, config.upload, opts);
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
    var nameCountFunc = function(s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    };
    var safeName = function(name) {
        // Prevent directory traversal and creating hidden system files:
        var name = path.basename(name).replace(/^\.+/, '');
        // Prevent overwriting existing files:
        while (_existsSync(options.uploadDir + '/' + name)) {
            name = name.replace(nameCountRegexp, nameCountFunc);
        }
        return name;
    };
    //构造文件url
    var initUrls = function(host, name) {
        var baseUrl = (options.useSSL ? 'https:' : 'http:') +
            '//' + host + options.uploadUrl;
        var url = baseUrl + encodeURIComponent(name);
        return url;
    };
    var validate = function(file) {
        var error = '';
        if (options.minFileSize && options.minFileSize > file.size) {
            error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < file.size) {
            error = 'File is too big';
        } else if (!options.acceptFileTypes.test(file.name)) {
            error = 'Filetype not allowed';
        }
        return !error;
    };
    var setNoCacheHeaders = function(res) {
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Content-Disposition', 'inline; filename="files.json"');
    };
    //七牛云存储
    var client = null;
    if (options.storage.type === 'qiniu') {
        client = qn.create(options.storage.options);
    }
    var Uploader = {};
    Uploader.delete = function(url, callback) {
        client.delete(url, function(err) {
            callback && callback.call(null, err);
        })
    };
    Uploader.post = function(req, res, callback) {
        var files = req.files.files;
        var len = files.length;
        if (len < 1) {
            return;
        }
        var result = [];
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
                var sName = safeName(file.name);
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