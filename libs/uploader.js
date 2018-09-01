'use strict';

//上传文件
//用法
// let upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
//todo: use multer https://cnodejs.org/topic/564f32631986c7df7e92b0db

const path = require('path');
const fs = require('fs');
const qn = require('qn');
const videoExtracter = require('video-extracter');
const mkdirp = require('mkdirp');
const del = require('del');

const config = require('../config');

const existsSync = fs.existsSync || path.existsSync
const nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/

class Uploader {
    constructor(opts) {
        this.options = Object.assign(config.upload, opts);
        this.checkExists(this.options.tmpDir);
        this.checkExists(this.options.uploadDir);
        this.client = qn.create(this.options.storage.options);
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
                    this.client.delete(fileName, function (err) {
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

    uploadSync(file) {
        return new Promise((resolve, reject) => {
            try {
                this.client.uploadFile(file.path, (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(res); // {url: 'xx'}
                });
            } catch (e) {
                reject(e.message);
            }
        });
    }

    move(file) {
        return new Promise(async (resolve, reject) => {
            let coverData = {};
            if (file.type.indexOf('video') > -1) {
                coverData = await videoExtracter(file.path, {
                    settings: {
                        number: 3
                    },
                    dirname: path.join(this.options.uploadDir, 'covers')
                });
                console.log('covers: ', coverData);
            }
            if (this.options.storage.type === 'qiniu') {
                console.log('开始七牛上传 ----- ');
                const res = await this.uploadSync(file);
                const coverFiles = [];
                console.log('qiniu res', res);
                if (coverData && coverData.files && coverData.files.length > 0) {
                    for (let i in coverData.files) {
                        const f = await this.uploadSync({
                            path: coverData.files[i]
                        });
                        coverFiles.push(f.url);
                    }
                    console.log('QINIU  封面: ', coverFiles)
                    del(coverData.dirname).then(res => {
                        console.log('del: ', res);
                    }).catch(e => {
                        console.log('del error: ', e);
                    })
                }
                resolve({
                    url: res.url,
                    md_url: res.url + '?imageView/1/w/300',
                    sm_url: res.url + '?imageView/1/w/100',
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    covers: coverFiles
                });
                try {
                    del(file.path).then((res) => {
                        console.log(res);
                    }).catch(e => {
                        console.log(e);
                    })
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log('开始本地上传 ----- ');
                const safeName = this.safeName(file.name);
                const filePath = path.join(this.options.uploadDir, safeName);
                let coverFiles = [];
                if (coverData.files) {
                    coverFiles = coverData.files.map(p => {
                        return path.join(this.options.uploadUrl, p.split(this.options.uploadUrl)[1]);
                    });
                }
                try {
                    fs.renameSync(file.path, filePath);
                    resolve({
                        url: path.join(this.options.uploadUrl, encodeURIComponent(safeName)),
                        name: safeName,
                        size: file.size,
                        type: file.type,
                        covers: coverFiles
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
                del(file.path).then((res) => {
                    console.log(res);
                }).catch(e => {
                    console.log(e);
                })
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