'use strict';

let mongoose = require('mongoose')
let util = require('../../../lib/util')
let FileService = require('../../../services/file')
let fileService = new FileService()
let _ = require('lodash')

exports.all = async function (req, res) {
  let condition = {}
  let pageInfo = {}
  let data = null
  let error
  try {
    let total = await fileService.count(condition)
    //分页
    pageInfo = util.createPage(req.query.page, total);

    data = await fileService.find(condition, null, {
      skip: pageInfo.start,
      limit: pageInfo.pageSize,
      sort: {
        created: -1
      }
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
    data = await fileService.findById(id)
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

exports.upload = async function (req, res) {
  let result = null;
  let error;
  const uid = req.body.uid;
  if (!uid) {
    error = '缺少参数 uid';
    return res.json({
      success: !error,
      error: error
    });
  }
  try {
    result = await fileService.upload(req.files.files, {
      author: req.body.uid || ''
    });
  } catch (e) {
    error = '上传失败'
  }
  res.json({
    success: !error,
    data: result,
    error: error
  });
}

exports.create = async function (req, res) {
  // let obj = req.body
  let obj = _.pick(req.body, 'url', 'md_url', 'sm_url', 'size', 'type', 'description');
  // TODO： 校验输入
  // 后台创建用户
  let user = req.user
  if (user) {
    obj.author = mongoose.Types.ObjectId(user._id)
  }

  let data = null
  let error
  try {
    data = await fileService.create(obj)
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

exports.update = async function (req, res) {
  let id = req.params.id
  // let obj = req.body
  let obj = _.pick(req.body, 'url', 'md_url', 'sm_url', 'size', 'type', 'description');
  // TODO： 校验输入
  let data = null
  let error
  try {
    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    let item = await fileService.findById(id)
    let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
    if (!isAdmin && !isAuthor) {
      error = '没有权限'
    } else {
      data = await fileService.findByIdAndUpdate(id, obj, { new: true })
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
  const id = req.params.id;
  let data;
  let error;
  try {
    const file = await fileService.findById(id, null, {
      populate: [{
        path: 'author',
        select: '_id name avatar'
      }]
    });
    const isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    const isAuthor = file.author && (file.author._id + '') === (req.user._id + '')
    if (!isAdmin && !isAuthor) {
      error = '没有权限';
    } else {
      data = await fileService.del(id);
    }
  } catch (e) {
    error = e.message;
  }
  res.json({
    success: !error,
    data: data,
    error: error
  })
}
