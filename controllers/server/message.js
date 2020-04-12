'use strict';

let mongoose = require('mongoose')
let Message = mongoose.model('Message')
let util = require('../../lib/util')

exports.list = function (req, res) {
  let condition = {};
  Message.count(condition, function (err, total) {
    let query = Message.find(condition);
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/message/list', {
        Menu: 'list',
        messages: results,
        pageInfo: pageInfo
      });
    })
  })

};

exports.one = function (req, res) {
  let id = req.params.id;
  Message.findById(id).exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/message/item', {
      title: result.name,
      message: result
    });
  });
};

exports.del = function (req, res) {
  let id = req.params.id;
  Message.findById(id).exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
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
