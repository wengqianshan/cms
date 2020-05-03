'use strict';

let mongoose = require('mongoose')
let Tag = mongoose.model('Tag')
let _ = require('lodash')
let util = require('../../lib/util')

exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  Tag.count(condition, function (err, total) {
    let query = Tag.find(condition).populate('author');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/tag/list', {
        tags: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    })
  })

};

exports.one = function (req, res) {
  let id = req.params.id;
  Tag.findById(id).populate('author', 'username name email').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/tag/item', {
      title: result.name,
      tag: result
    });
  });
};

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
          message: 'Failure'
        });
      }
      res.render('server/info', {
        message: 'Success'
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
          message: 'no permission'
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
          message: 'no permission'
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
            message: 'Success'
          });
        }
      });
    });
  }
};

exports.del = function (req, res) {
  let id = req.params.id;
  Tag.findById(id).populate('author').exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    let isAdmin = req.isAdmin;
    let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

    if (!isAdmin && !isAuthor) {
      return res.render('server/info', {
        message: 'no permission'
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
          message: 'Failure'
        });
      }
      res.render('server/info', {
        message: 'Success'
      })
    });
  });
};
