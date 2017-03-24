'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('Category'),
    Tag = mongoose.model('Tag'),
    _ = require('underscore'),
    core = require('../../libs/core');
var xss = require('xss');
/*var userService = require('../../services/user')
userService.findById('53b6ca419dfe0cf41ccbaf96', ['roles', 'author']).then(function(res) {
    console.log(res)
}, function(err) {
    console.log(err)
})*/

//var contentService = require('../../services/content');

//console.log(contentService, 111);

/*contentService.findBySome('5741aeb9e5ba3ff9025dfdec').then(function(res) {
    console.log(res, 222);
})*/


//同步mysql
//先安装mysql模块 npm install mysql
/*var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'ouyo'
});
connection.connect();
connection.query('select * from info', function(err, result) {
    result.forEach(function(item) {
        var content = new Content({
            title: item.title,
            content: item.content,
            created: item.created
        });
        content.save(function(c) {
            console.log('保存成功', c);
        });
    })
});*/
//备份end
//列表
exports.list = function(req, res) {
    var condition = {};
    var category = req.query.category;
    if(category) {
        condition.category = category;
    }
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    //查数据总数
    Content.count(condition).exec().then(function(total) {
        var query = Content.find(condition).populate('author', 'username name email');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/content/list', {
                title: '内容列表',
                contents: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        });
    });
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    var nested = req.query.comment_list;
    Content.findById(id).populate('author').populate('category').populate('comments').populate('gallery').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('server/content/item', {
            title: result.title,
            content: result,
            comment_list: nested
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        var condition = {};
        if(req.Roles && req.Roles.indexOf('admin') < 0) {
            condition.author = req.session.user._id;
        }
        /*Category.find(condition, function(err, results) {
            res.render('server/content/add', {
                categorys: results,
                Menu: 'add'
            });
        });*/
        Category.find(condition).exec().then(function(categorys) {
            //console.log(categorys);
            Tag.find(condition).exec().then(function(tags) {
                //console.log(tags)
                res.render('server/content/add', {
                    categorys: categorys,
                    tags: tags,
                    Menu: 'add'
                });
            });
        })
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if(obj.category === '') {
            obj.category = null;
        }
        obj.content = xss(obj.content);
        
        var content = new Content(obj);
        content.save(function(err, content) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                console.log(err);
                return res.render('server/info', {
                    message: '创建失败'
                });
            }

            res.render('server/info', {
                message: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Content.findById(id).populate('author gallery tags').exec(function(err, result) {
            if(err) {
                console.log('加载内容失败');
            }
            var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            var condition = {};
            if(req.Roles && req.Roles.indexOf('admin') < 0) {
                condition.author = req.session.user._id;
            }
            Category.find(condition, function(err, categorys) {
                Tag.find(condition).exec().then(function(tags) {
                    //console.log(tags)
                    res.render('server/content/edit', {
                        content: result,
                        categorys: categorys,
                        tags: tags,
                        Menu: 'edit'
                    });
                });
                
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        console.log(obj);
        console.log(obj.gallery)
        if(obj.category === '') {
            obj.category = null;
        }
        if(!obj.gallery) {
            obj.gallery = [];
        }
        
        Content.findById(id).populate('author').exec(function(err, result) {
            //console.log(result);
            var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.extend(result, obj);
            result.save(function(err, content) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
                if(err || !content) {
                    return res.render('server/info', {
                        message: '修改失败'
                    });
                }
                res.render('server/info', {
                    message: '更新成功'
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Content.findById(id).populate('author').exec(function(err, result) {
        if(err || !result) {
            return res.render('server/info', {
                message: '内容不存在'
            });
        }
        var isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        var isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        //
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                });
            }
            if(err) {
                return res.render('server/info', {
                    message: '删除失败'
                });
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    });
};