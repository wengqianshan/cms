'use strict';

let  mongoose = require('mongoose')
let fs = require('fs')
let path = require('path')
let File = mongoose.model('File')
let _ = require('lodash')
let config = require('../../config')
let core = require('../../libs/core')

let FileService = require('../../services/file')
let fileService = new FileService()

const Uploader = require('../../libs/uploader');
const uploader = new Uploader();
//列表
exports.list = function(req, res) {
    //console.log(req.cookies['XSRF-TOKEN'])
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    File.count(condition, function(err, total) {
        let query = File.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        console.log(pageInfo)
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(results)
            res.render('server/file/list', {
                files: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        });
    })
};
//单条
exports.one = function(req, res) {
    let id = req.params.id;
    File.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该文件不存在'
            });
        }
        res.render('server/file/item', {
            title: result.name,
            role: result
        });
    });
};
//添加
exports.add = async function(req, res) {
    if (req.method === 'GET') {
        res.render('server/file/add', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {
        let result = {};
        try {
            result = await fileService.upload(req.files.files, {
                author: req.session.user._id
            });
        } catch (e) {
            console.log(e)
        }
        res.json(result);
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        File.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            res.render('server/file/edit', {
                file: result
            });
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'url', 'md_url', 'sm_url', 'size', 'type', 'description');
        File.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.assign(result, obj);
            result.save(function(err, role) {
                res.render('server/info', {
                    message: '更新成功'
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    File.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '文件不存在'
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        //console.log(result);
        let url = result.url;
        uploader.delete(url, function(e) {
            if (e) {
                console.log('文件删除失败')
                // return res.json({
                //     success: false,
                //     error: e
                // });
            }
            result.remove(function(err) {
                if(req.xhr) {
                    return res.json({
                        success: !err,
                        error: err
                    });
                }
                if(err) {
                    return res.render('server/info', {
                        message: '删除失败'
                    });
                }
                res.render('server/info', {
                    message: '删除成功'
                });
            })
        })
    });
};