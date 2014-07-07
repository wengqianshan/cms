'use strict';
var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    File = mongoose.model('File'),
    _ = require('underscore'),
    config = require('../../config'),
    core = require('../../libs/core');

var uploader = require('../../libs/uploader')(config.upload);
//列表
exports.list = function(req, res) {
    //console.log(req.cookies['XSRF-TOKEN'])
    var condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    File.count(condition, function(err, total) {
        var query = File.find(condition).populate('author');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(results)
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
    var id = req.param('id');
    File.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/message', {
                msg: '该文件不存在'
            });
        }
        res.render('server/file/item', {
            title: result.name,
            role: result
        });
    });
};
//七牛 TODO
/*var qn = require('qn');
var client = qn.create({
  accessKey: 'key',
  secretKey: 'secret',
  bucket: 'wenglou',
  domain: 'http://wenglou.qiniudn.com',
  // timeout: 3600000, // default rpc timeout: one hour, optional
});
client.uploadFile(file.path, {key: file.name}, function (err, result) {
  console.log(result);
});*/
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/file/add', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {
        //console.log(req.files);
        //console.log(req.body);
        uploader.post(req, res, function (result) {
            console.log(result);
            if(!result || !result.files) {
                return;
            }
            var id = req.body.id;
            //如果是修改文件，则不保存到服务器
            if(id) {
                console.log('修改文件');
                File.findById(id).populate('author').exec(function(err, file) {
                    if(req.Roles.indexOf('admin') === -1 && (!file.author || (file.author._id + '') !== req.session.user._id)) {
                        return res.render('server/message', {
                            msg: '没有权限'
                        });
                    }
                    //TODO: 删除之前的文件 uploader.delete()?
                    fs.unlink(config.upload.uploadDir + '/' + file.name, function(err) {
                        console.log('删除成功', config.upload.uploadDir + '/' + file.name)
                    });
                    res.json(result);
                });
                return;
            }
            var len = result.files.length;
            var json = {
                files: []
            };
            result.files.forEach(function(item) {
                if(req.session.user) {
                    item.author = req.session.user._id;
                }
                //这里还可以处理url
                var fileObj = item;//_.pick(item, 'name', 'size', 'type', 'url');
                console.log(fileObj);
                var file = new File(fileObj);
                file.save(function(err, obj) {
                    if(err || !obj) {
                        console.log('保存file失败', err, obj);
                        return;
                    }
                    len --;
                    item._id = obj._id;
                    json.files.push(item);
                    if(len === 0) {
                        console.log(json)
                        res.json(json);
                    }
                });
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        File.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
                return res.render('server/message', {
                    msg: '没有权限'
                });
            }
            res.render('server/file/edit', {
                file: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        File.findById(id).populate('author').exec(function(err, result) {
            if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
                return res.render('server/message', {
                    msg: '没有权限'
                });
            }
            _.extend(result, obj);
            result.save(function(err, role) {
                res.render('server/message', {
                    msg: '更新成功'
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    File.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/message', {
                msg: '文件不存在'
            });
        }
        if(req.Roles.indexOf('admin') === -1 && (!result.author || (result.author._id + '') !== req.session.user._id)) {
            return res.render('server/message', {
                msg: '没有权限'
            });
        }
        console.log(result);
        var url = result.url;
        var fileName = path.basename(decodeURIComponent(url));
        if (fileName[0] !== '.') {
            fs.unlink(config.upload.uploadDir + '/' + fileName, function (err) {
                result.remove(function(err) {
                    if(err) {
                        return res.render('server/message', {
                            msg: '删除失败222'
                        });
                    }
                    res.render('server/message', {
                        msg: '删除成功'
                    });
                })
            });
            return;
        }
        return;
        result.remove(function(err) {
            if(err) {
                return res.render('server/message', {
                    msg: '删除失败222'
                });
            }
            res.render('server/message', {
                msg: '删除成功'
            });
        });
    });
};