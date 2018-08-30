'use strict';

//上传文件
//用法
// let upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
//todo: use multer https://cnodejs.org/topic/564f32631986c7df7e92b0db

let path = require('path')
let fs = require('fs')
let _ = require('lodash')
let qn = require('qn')
let config = require('../config')
let existsSync = fs.existsSync || path.existsSync
let mkdirp = require('mkdirp')
let nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/

class Uploader {
    constructor(opts) {
        this.options = Object.assign(config.upload, opts);
        this.checkExists(this.options.tmpDir);
        this.checkExists(this.options.uploadDir);
        this.client = null
        if (this.options.storage.type === 'qiniu') {
            this.client = qn.create(this.options.storage.options);
        }
    }

    checkExists(dir) {
        fs.exists(dir, function (exists) {
            if (!exists) {
                mkdirp(dir, function (err) {
                    if (err) console.error(err)
                    else console.log("默认目录不存在，已自动创建： [" + dir + "]");
                });
            }
        });
    }

    nameCountFunc(s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    }

    safeName(_name) {
        let name = path.basename(_name).replace(/^\.+/, '');
        while (existsSync(this.options.uploadDir + '/' + name)) {
            name = name.replace(nameCountRegexp, this.nameCountFunc);
        }
        return name;
    }

    initUrls(name) {
        let url = path.join(this.options.uploadUrl, encodeURIComponent(name));
        return url;
    }

    validate(file) {
        let error = '';
        if (this.options.minFileSize && this.options.minFileSize > file.size) {
            error = 'File is too small';
        } else if (this.options.maxFileSize && this.options.maxFileSize < file.size) {
            error = 'File is too big';
        } else if (!this.options.acceptFileTypes.test(file.name)) {
            error = 'Filetype not allowed';
        }
        return !error;
    }

    delete(url, callback) {
        let fileName = path.basename(decodeURIComponent(url))
        console.log('删除文件', url, fileName);
        if (fileName[0] !== '.') {
            if (url.indexOf(this.options.storage.options.domain) > -1) {
                try {
                    client.delete(fileName, function (err) {
                        callback && callback.call(null, err);
                    })
                } catch (e) {
                    console.log('删除7牛图片失败', e);
                    callback && callback.call(null, '删除7牛图片失败');
                }
            } else {
                fs.unlink(this.options.uploadDir + '/' + fileName, function (err) {
                    callback && callback.call(null, err);
                });
            }
        } else {
            callback && callback.call(null, '文件类型错误');
        }
    }

    move(file) {
        return new Promise((resolve, reject) => {
            if (this.options.storage.type === 'qiqiu') {
                client.uploadFile(file.path, (err, qf) => {
                    if (err) {
                        return reject(err);
                    }
                    try {
                        fs.unlink(file.path);
                    } catch (e) {
                        console.log(e);
                    }
                    resolve({
                        url: qf.url,
                        md_url: qf.url + '?imageView/1/w/300',
                        sm_url: qf.url + '?imageView/1/w/100',
                        name: file.name,
                        size: file.size,
                        type: file.type
                    })
                })
            } else {
                const safeName = this.safeName(file.name);
                const filePath = path.join(this.options.uploadDir, safeName);
                try {
                    fs.renameSync(file.path, filePath);
                    resolve({
                        url: this.initUrls(safeName),
                        name: safeName,
                        size: file.size,
                        type: file.type
                    });
                } catch (e) {
                    reject(e.message);
                }
            }
        });
    }

    post(files, callback) {
        if (!files || files.length < 1) {
            return callback();
        }
        const fns = [];
        files.forEach((file) => {
            if (!this.validate(file)) {
                fs.unlink(file.path);
                return;
            }
            fns.push(this.move(file));
        });
        Promise.all(fns).then((res) => {
            // console.log('promise: ', res);
            callback({
                files: res
            });
        }).catch(e => {
            // console.log(e)
            callback({
                files: []
            });
        });
    }


}

module.exports = Uploader;