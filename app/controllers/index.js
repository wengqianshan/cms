'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    File = mongoose.model('File'),
    config = require('../../config'),
    _ = require('underscore'),
    util = require('../../server/libs/util');
exports.index = function(req, res) {
    console.log('前台')
    //console.time('content-list');
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
    }
    Content.count(condition, function(err, total) {
        var query = Content.find(condition).populate('author', 'username name email').populate('comments');
        //分页
        var pageInfo = util.createPage(req, total, 10);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            //console.timeEnd('content-list');
            res.render('app/index', {
                //title: '列表',
                title: '网站首页',
                contents: results,
                pageInfo: pageInfo
            });
        })
    });
    
};

// init the uploader  https://github.com/arvindr21/blueimp-file-upload-expressjs
var uploader = require('blueimp-file-upload-expressjs')(config.upload);

exports.upload = function(req, res) {
    if(req.method === 'GET') {
        res.render('app/upload');
    } else if(req.method === 'POST') {
        uploader.post(req, res, function (result) {
            console.log(result);
            if(!result || !result.files) {
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
                        //res.send(JSON.stringify(result)); 
                        console.log(json)
                        res.json(json);
                    }
                    //console.log('保存文件', file);
                });
            });
            //res.send(JSON.stringify(result)); 
        });
        
    }
};
//列表
exports.list = function(req, res) {
    //console.time('content-list');
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
    }
    Content.find(condition).populate('author', 'username name email').exec(function(err, results) {
        //console.log(err, results);
        //console.timeEnd('content-list');
        res.render('app/content/list', {
            //title: '列表',
            contents: results
        });
    })
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Content.findById(id).populate('author', 'username name email').populate('category').exec(function(err, result) {
        console.log(result);
        result.visits = result.visits + 1;
        result.save();
        if(!result) {
            return res.render('message', {
                msg: '该内容不存在'
            });
        }
        res.render('content/item', {
            title: result.title,
            content: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        Category.find(function(err, results) {
            res.render('content/add', {
                categorys: results
            });
        });
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var content = new Content(obj);
        content.save(function(err, content) {
            if (err) {
                return res.render('message', {
                    msg: '创建失败'
                });
            }
            res.render('message', {
                msg: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Content.findById(id, function(err, result) {
            if(err) {
                console.log('加载内容失败');
            }
            Category.find(function(err, categorys) {
                res.render('content/edit', {
                    content: result,
                    categorys: categorys
                });
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        Content.findByIdAndUpdate(id, obj, function(err, result) {
            console.log(err, result);
            if(!err) {
                res.render('message', {
                    msg: '更新成功'
                });
            }
        })
    }
};