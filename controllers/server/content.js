'use strict';

let mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let Tag = mongoose.model('Tag')
let _ = require('lodash')
let util = require('../../lib/util')

exports.list = function (req, res) {
  let condition = {};
  let category = req.query.category;
  if (category) {
    condition.category = category;
  }
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  
  Content.count(condition).exec().then(function (total) {
    let query = Content.find(condition).populate('author', 'username name email');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/content/list', {
        title: 'Content List',
        contents: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    });
  });
};

exports.add = function (req, res) {
  if (req.method === 'GET') {
    let condition = {};
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      condition.author = req.session.user._id;
    }
    Promise.all([Category.find(condition).exec(), Tag.find(condition).exec()]).then((result) => {
      res.render('server/content/add', {
        categorys: result[0],
        tags: result[1],
        Menu: 'add'
      });
    }).catch((e) => {
      res.render('server/content/add', {
        Menu: 'add'
      });
    })
  } else if (req.method === 'POST') {
    let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags');
    if (req.session.user) {
      obj.author = req.session.user._id;
    }
    if (obj.category === '') {
      obj.category = null;
    }

    let content = new Content(obj);
    content.save(function (err, content) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
      }
      if (err) {
        console.log(err);
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
    Content.findById(id).populate('author gallery tags').exec(function (err, result) {
      if (err) {
        console.log('Failure');
      }
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      let condition = {};
      if (!isAdmin) {
        condition.author = req.session.user._id;
      }
      Category.find(condition, function (err, categorys) {
        Tag.find(condition).exec().then(function (tags) {
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
  } else if (req.method === 'POST') {
    let id = req.params.id;
    let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags');
    console.log(obj);
    console.log(obj.gallery)
    if (obj.category === '') {
      obj.category = null;
    }
    if (!obj.gallery) {
      obj.gallery = [];
    }

    Content.findById(id).populate('author').exec(function (err, result) {
      //console.log(result);
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      _.assign(result, obj);
      result.save(function (err, content) {
        if (req.xhr) {
          return res.json({
            status: !err
          })
        }
        if (err || !content) {
          return res.render('server/info', {
            message: 'Failure'
          });
        }
        res.render('server/info', {
          message: 'Success'
        });
      });
    });
  }
};

exports.del = function (req, res) {
  let id = req.params.id;
  Content.findById(id).populate('author').exec(function (err, result) {
    if (err || !result) {
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
    //
    result.remove(function (err) {
      if (req.xhr) {
        return res.json({
          status: !err
        });
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
