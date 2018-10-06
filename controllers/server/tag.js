'use strict';

let mongoose = require('mongoose')
let Tag = mongoose.model('Tag')
let _ = require('lodash')
let util = require('../../lib/util')

//列表
exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  Tag.count(condition, function (err, total) {
    let query = Tag.find(condition).populate('author');
    //分页
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/tag/list', {
        //title: '列表',
        tags: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    })
  })

};
//单条
exports.one = function (req, res) {
  let id = req.params.id;
  Tag.findById(id).populate('author', 'username name email').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: '该分类不存在'
      });
    }
    res.render('server/tag/item', {
      title: result.name,
      tag: result
    });
  });
};
//添加
exports.add = function (req, res) {
  if (req.method === 'GET') {
    res.render('server/tag/add', {
      Menu: 'add'
    });
  } else if (req.method === 'POST') {
    let obj = _.pick(req.body, 'name', 'description');
    if (req.session.user) {
      obj.author = req.session.user._id;
    }
    let tag = new Tag(obj);
    tag.save(function (err, tag) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
      }
      if (err) {
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
exports.edit = function (req, res) {
  if (req.method === 'GET') {
    let id = req.params.id;
    Tag.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: '没有权限'
        });
      }
      res.render('server/tag/edit', {
        tag: result
      });
    });
  } else if (req.method === 'POST') {
    let id = req.params.id;
    let obj = _.pick(req.body, 'name', 'description');
    Tag.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: '没有权限'
        });
      }
      _.assign(result, obj);
      result.save(function (err, tag) {
        if (req.xhr) {
          return res.json({
            status: !err
          })
        }
        if (!err) {
          res.render('server/info', {
            message: '更新成功'
          });
        }
      });
    });
  }
};
//删除
exports.del = function (req, res) {
  let id = req.params.id;
  Tag.findById(id).populate('author').exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: '分类不存在'
      });
    }
    let isAdmin = req.isAdmin;
    let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

    if (!isAdmin && !isAuthor) {
      return res.render('server/info', {
        message: '没有权限'
      });
    }
    result.remove(function (err) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
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
