'use strict';

let _ = require('lodash');
let mongoose = require('mongoose');
let xss = require('xss');
let core = require('../../../libs/core');
let MessageService = require('../../../services/message');
let messageService = new MessageService();

exports.all = async function (req, res) {
  let condition = {}
  let pageInfo = {}
  let data = null
  let error
  try {
    let total = await messageService.count(condition)
    //分页
    pageInfo = core.createPage(req.query.page, total);

    data = await messageService.find(condition, null, {
      skip: pageInfo.start,
      limit: pageInfo.pageSize,
      sort: {
        created: -1
      }
    })
    data = data.map((item) => {
      return _.pick(item, '_id', 'name', 'email', 'mobile', 'address', 'content', 'author', 'created', 'ip');
    })
  } catch (e) {
    // error = e.message
    error = '系统异常'
  }

  res.json({
    success: !error,
    data: data,
    error: error,
    pageInfo: pageInfo
  });
};
exports.show = async function (req, res) {
  let id = req.params.id;
  let data = null
  let error
  try {
    data = await messageService.findById(id)
  } catch (e) {
    // error = e.message
    error = '系统异常'
  }

  res.json({
    success: !error,
    data: data,
    error: error
  });
}

exports.create = async function (req, res) {
  let body = req.body;
  // console.log(body);
  let obj = _.pick(body, 'name', 'email', 'mobile', 'address', 'content');
  obj.ip = core.getIp(req);
  obj.content = xss(obj.content);

  let user = req.user
  if (user) {
    obj.author = mongoose.Types.ObjectId(user._id)
  }
  let data;
  let error;
  try {
    data = await messageService.create(obj);
  } catch (e) {
    // console.log(e);
    error = e.message;
  }
  res.json({
    success: !error,
    data: data,
    error: error
  });
}

exports.update = async function (req, res) {
  let id = req.params.id
  // let obj = req.body
  let obj = _.pick(req.body, 'name', 'email', 'mobile', 'address', 'content');
  // TODO： 校验输入
  let data = null
  let error
  try {
    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    let item = await messageService.findById(id)
    let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
    if (!isAdmin && !isAuthor) {
      error = '没有权限'
    } else {
      data = await messageService.findByIdAndUpdate(id, obj, { new: true })
    }

  } catch (e) {
    // error = e.message
    error = '系统异常'
  }
  res.json({
    success: !error,
    data: data,
    error: error
  })
}

exports.destroy = async function (req, res) {
  let id = req.params.id
  let data = null
  let error
  try {
    data = messageService.findByIdAndRemove(id)
  } catch (e) {
    // error = e.message
    error = '系统异常'
  }
  res.json({
    success: !error,
    data: data,
    error: error
  })
}
