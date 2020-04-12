'use strict';

let mongoose = require('mongoose')
let Notification = mongoose.model('Notification')
let util = require('../../lib/util')
let _ = require('lodash')

exports.list = function (req, res) {
  let condition = {};
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      results = results.map(function (item) {
        let isRead = false;
        item.isRead = item.read.filter((n) => {
          return n.id === req.session.user._id;
        }).length > 0
        //item.isRead = item.read.indexOf(req.session.user._id) > -1;
        return item;
      })
      res.render('server/notification/list', {
        Menu: 'list',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};

exports.received = function (req, res) {
  let condition = {
    to: req.session.user._id
  };
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      results = results.map(function (item) {
        let isRead = false;
        item.isRead = item.read.filter((n) => {
          return n.id === req.session.user._id;
        }).length > 0
        //item.isRead = item.read.indexOf(req.session.user._id) > -1;
        return item;
      })
      res.render('server/notification/list', {
        Menu: 'received',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};

exports.sent = function (req, res) {
  //console.log(req.headers, req.session.user)
  //console.log('id', req.session.user._id)
  let condition = {
    from: req.session.user._id
  };
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    let pageInfo = util.createPage(req.query.page, total);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      console.log(err, results);
      results = results.map(function (item) {
        let isRead = false;
        item.isRead = item.read.filter((n) => {
          return n.id === req.session.user._id;
        }).length > 0
        //item.isRead = item.read.indexOf(req.session.user._id) > -1;
        return item;
      })
      res.render('server/notification/list', {
        Menu: 'sent',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};

exports.one = function (req, res) {
  let id = req.params.id;
  Notification.findById(id).exec(function (err, result) {
    if (req.session.user._id) {
      let verify = (result.broadcast || result.to.indexOf(req.session.user._id) > -1);
      if (result.read.indexOf(req.session.user._id) < 0 && verify) {
        let notification = markRead(result, req.session.user._id);
        notification.save(function (err, result) {
        })
      }

    }

    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/notification/item', {
      title: result.content,
      notification: result
    });
  });
};

function markRead(notification, uid) {
  if (!notification.broadcast) {
    notification.unread = notification.unread.filter((item) => {
      return (item + '') !== (uid + '')
    })
  }
  notification.read.push(mongoose.Types.ObjectId(uid))
  return notification;
}

exports.del = function (req, res) {
  let id = req.params.id;
  Notification.findById(id).exec(function (err, result) {
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

exports.add = function (req, res) {
  let obj = _.pick(req.body, 'content', 'to');
  if (!obj.to || !_.isArray(obj.to)) {
    return res.json({
      status: false,
      message: "Incorrect parameters",
    });
  }
  obj.from = mongoose.Types.ObjectId(req.session.user._id);
  obj.to = obj.to.map(function (item) {
    return mongoose.Types.ObjectId(item) || '';
  })
  obj.unread = obj.to;
  let notification = new Notification(obj);
  notification.save(function (err) {
    if (err) {
      console.log(err);
      return res.json({
        status: false,
        message: 'Failure'
      })
    }
    return res.json({
      status: true,
      message: 'Success'
    })
  });
};
