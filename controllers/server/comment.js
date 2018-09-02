'use strict';

let mongoose = require('mongoose')
let Comment = mongoose.model('Comment')
let util = require('../../lib/util')

//列表
exports.list = function (req, res) {
  let condition = {};
  if (req.Roles && req.Roles.indexOf('admin') < 0) {
    condition.author = req.session.user._id;
  }
  Comment.count(condition, function (err, total) {
    let query = Comment.find(condition).populate('author').populate('from');
    //分页
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/comment/list', {
        //title: '列表',
        comments: results,
        pageInfo: pageInfo
      });
    })
  })

};
//单条
exports.one = function (req, res) {
  let id = req.params.id;
  Comment.findById(id).populate('author', 'username name email').populate('from').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: '该评论不存在'
      });
    }
    res.render('server/comment/item', {
      title: result.name,
      comment: result
    });
  });
};
//删除
exports.del = function (req, res) {
  let id = req.params.id;
  Comment.findById(id).populate('author').populate('from').exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: '评论不存在'
      });
    }

    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    let isOwner = result.from && ((result.from.author + '') === req.session.user._id);

    if (!isAdmin && !isOwner) {
      return res.render('server/info', {
        message: '没有权限'
      });
    }
    console.log(result)
    result.remove(function (err) {
      if (req.xhr) {
        return res.json({
          status: !err
        });
      }
      if (err) {
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
