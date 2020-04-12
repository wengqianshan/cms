'use strict';

let mongoose = require('mongoose')
let Log = mongoose.model('Log')
let util = require('../../lib/util')

exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  Log.count(condition, function (err, total) {
    let query = Log.find(condition);
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/log/list', {
        data: results,
        pageInfo: pageInfo
      });
    })
  })
};

exports.one = function (req, res) {
  let id = req.params.id;
  Log.findById(id).populate('author', 'username name').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/log/item', {
      data: result
    });
  });
};

exports.del = function (req, res) {
  let id = req.params.id;
  Log.findById(id).populate('author').exec(function (err, result) {
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
    console.log(result)
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
