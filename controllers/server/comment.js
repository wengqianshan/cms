'use strict';

let mongoose = require('mongoose')
let Comment = mongoose.model('Comment')
let util = require('../../lib/util')

exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  Comment.count(condition, function (err, total) {
    let query = Comment.find(condition).populate('author').populate('from');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/comment/list', {
        comments: results,
        pageInfo: pageInfo
      });
    })
  })

};

exports.one = function (req, res) {
  let id = req.params.id;
  Comment.findById(id).populate('author', 'username name email').populate('from').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/comment/item', {
      title: result.name,
      comment: result
    });
  });
};

exports.del = function (req, res) {
  let id = req.params.id;
  Comment.findById(id).populate('author').populate('from').exec(function (err, result) {
    if (!result) {
      return res.render("server/info", {
        message: "Not Exist",
      });
    }

    let isAdmin = req.isAdmin;
    let isOwner = result.from && ((result.from.author + '') === req.session.user._id);

    if (!isAdmin && !isOwner) {
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
