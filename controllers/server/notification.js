'use strict';

let mongoose = require('mongoose')
let Notification = mongoose.model('Notification')
let util = require('../../lib/util')
let _ = require('lodash')

//列表
exports.list = function (req, res) {
  let condition = {};
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    //分页
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
        //title: '列表',
        Menu: 'list',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};
//已收到
exports.received = function (req, res) {
  let condition = {
    to: req.session.user._id
  };
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    //分页
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
        //title: '列表',
        Menu: 'received',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};
//已发出
exports.sent = function (req, res) {
  //console.log(req.headers, req.session.user)
  //console.log('id', req.session.user._id)
  let condition = {
    from: req.session.user._id
  };
  Notification.count(condition, function (err, total) {
    let query = Notification.find(condition).populate('from to read unread');
    //分页
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
        //title: '列表',
        Menu: 'sent',
        notifications: results,
        pageInfo: pageInfo
      });
    })
  })
};
//单条
exports.one = function (req, res) {
  let id = req.params.id;
  Notification.findById(id).exec(function (err, result) {
    // console.log(result, '单条信息+++++++++++++++++');
    if (req.session.user._id) {
      let verify = (result.broadcast || result.to.indexOf(req.session.user._id) > -1);
      if (result.read.indexOf(req.session.user._id) < 0 && verify) {
        // console.log('未读消息，设置已读+')
        let notification = markRead(result, req.session.user._id);
        notification.save(function (err, result) {
          // console.log(err, result, '更新通知+++++++++++++++++')
        })
      }

    }

    if (!result) {
      return res.render('server/info', {
        message: '该留言不存在'
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
    // 如果不是系统通知，从未读列表去除接收者
    notification.unread = notification.unread.filter((item) => {
      return (item + '') !== (uid + '')
    })
  }
  // 已读列表增加接收者
  notification.read.push(mongoose.Types.ObjectId(uid))
  return notification;
}
//删除
exports.del = function (req, res) {
  let id = req.params.id;
  Notification.findById(id).exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: '留言不存在'
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

//发送
exports.add = function (req, res) {
  let obj = _.pick(req.body, 'content', 'to');
  if (!obj.to || !_.isArray(obj.to)) {
    return res.json({
      status: false,
      message: '参数不正确'
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
        message: '发送失败'
      })
    }
    return res.json({
      status: true,
      message: '发送成功'
    })
  });
};
