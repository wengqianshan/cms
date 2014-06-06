'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content');
//列表
exports.list = function(req, res) {
    console.time('content-list');
    Content.find({}).populate('author', 'username name email').exec(function(err, results) {
        //console.log(err, results);
        console.timeEnd('content-list');
        res.render('content/list', {
            //title: '列表',
            contents: results
        });
    })
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Content.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        res.render('content/item', {
            title: result.title,
            content: result
        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('content/add');
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
            res.render('content/edit', {
                content: result
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        Content.findByIdAndUpdate(id, obj, function(err, result) {
            //console.log(err, result);
            if(!err) {
                res.render('message', {
                    msg: '更新成功'
                });
            }
        })
    }
};
//删除
exports.del = function(req, res) {
    if(!req.session.user) {
        return res.render('message', {
            msg: '请先登录'
        });
    }
    var id = req.params.id;
    Content.findById(id, function(err, result) {
        if(!result) {
            return res.render('message', {
                msg: '内容不存在'
            });
        }
        if(!result.author || result.author == req.session.user._id) {
            result.remove(function(err) {
                if(err) {
                    return res.render('message', {
                        msg: '删除失败222'
                    });
                }
                res.render('message', {
                    msg: '删除成功'
                })
            });
        }else {
            return res.render('message', {
                msg: '你没有权限删除别人的文章'
            });
        }
    });
    /*Content.findByIdAndRemove(id, function(err, result) {
        console.log(err, result)
        if(err) {
            return res.render('message', {
                msg: '删除失败'
            });
        }
        res.render('message', {
            msg: '删除成功'
        })
    })*/
};
exports.find = function(condition) {
    Content.find(condition, function(err, results) {
        console.log(results);
        results.forEach(function(item) {
            console.log(item.id)
        })
    });
};
exports.remove = function(id) {
    Content.findByIdAndRemove(id, function(err, content) {
        console.log(err, content);
    })
};