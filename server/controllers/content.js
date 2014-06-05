'use strict';
var mongoose = require('mongoose'),
    Content = mongoose.model('Content');

exports.list = function(req, res) {
    console.time('content-list');
    Content.find(function(err, results) {
        //console.log(err, results);
        console.timeEnd('content-list');
        res.render('content/list', {
            //title: '列表',
            contents: results
        });
    })
};
exports.one = function(req, res) {
    var id = req.param('id');
    Content.findById(id).populate('author').exec(function(err, result) {
        res.render('content/item', {
            title: '正文',
            content: result
        });
    })
    /*Content.findById(id, function(err, result) {
        res.render('content/item', {
            title: '正文',
            content: result
        });
    });*/
};
exports.add = function(req, res) {
    if(req.method === 'GET') {
        res.render('content/add');
    } else if(req.method === 'POST') {
        var obj = req.body;
        if(req.session.user) {
            obj.author = req.session.user._id;
        }
        var content = new Content(obj);
        content.save(function(err, content) {
            if(err) {
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
