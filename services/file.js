/**
 * 文件服务
 **/
'use strict';

let fs = require('fs');
let mongoose = require('mongoose');
let _ = require('lodash');
let File = mongoose.model('File');

let config = require('../config')
let uploader = require('../libs/uploader')(config.upload);

let Base = require('./base');

class Service extends Base {
    constructor(props) {
        super(props);
        this.Model = File;
    }

    findBySome(id, populates) {
        return new Promise((resolve, reject) => {
            let query = this.Model.findById(id)
            if (populates && populates.length > 0) {
                populates.forEach(function (item) {
                    query = query.populate(item);
                })
            }
            query.exec(function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            });
        })
    }

    upload(files) {
        console.log('调试开始')
        return new Promise((resolve, reject) => {
            uploader.post(files, (result) => {
                console.log('上传结果', result);

                if (!result || !result.files) {
                    return reject({
                        code: -1,
                        message: '未知错误'
                    });
                }
                let id = req.body.id;
                //如果是修改文件，则不保存到服务器
                if (id) {
                    console.log('修改文件');
                    this.Model.findById(id).populate('author').exec(function (err, file) {
                        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
                        let isAuthor = file.author && ((file.author._id + '') === req.session.user._id);

                        if (!isAdmin && !isAuthor) {
                            return reject({
                                code: -1,
                                message: '没有权限'
                            });
                        }
                        //TODO: 删除之前的文件 uploader.delete()?
                        fs.unlink(config.upload.uploadDir + '/' + file.name, function (err) {
                            console.log('删除成功', config.upload.uploadDir + '/' + file.name)
                        });
                        // todo: 更新文件信息

                        resolve(result);
                    });
                    return;
                }
                let len = result.files.length;
                let json = {
                    files: []
                };
                result.files.forEach((item) => {
                    if (req.session.user) {
                        item.author = req.session.user._id;
                    }
                    //这里还可以处理url
                    let fileObj = item; //_.pick(item, 'name', 'size', 'type', 'url');
                    console.log(fileObj);
                    let file = new this.Model(fileObj);
                    file.save((err, obj) => {
                        if (err || !obj) {
                            console.log('保存file失败', err, obj);
                            return;
                        }
                        len--;
                        item._id = obj._id;
                        json.files.push(item);
                        if (len === 0) {
                            console.log(json)
                            resolve(json);
                        }
                    });
                });
            });
        });
    }
}

module.exports = Service;

