'use strict';

let _ = require('lodash')
let mongoose = require('mongoose')
let util = require('../../../lib/util')
let $page = require('../../../lib/page')
let ContentService = require('../../../services/content')
let contentService = new ContentService();

exports.all = async function (req, res) {
  let condition = {}
  const query = req.query;
  if (query.s) {
    condition.title = new RegExp(query.s, 'gi');
  }
  let { current, pageSize } = $page.parse(query);
  let pagination;
  
  let data
  let error
  try {
    let total = await contentService.count(condition)
    pagination = {
      current,
      pageSize,
      total,
    };
    data = await contentService.find(condition, null, {
      populate: [{
        path: 'author',
        select: 'name avatar'
      }, {
        path: 'gallery',
        match: { type: /(image)|(video)/ },
        select: 'name url md_url sm_url type covers',
        options: {
          limit: 3
        }
      }],
      skip: pageSize * (current - 1),
      limit: pageSize,
      sort: {
        created: -1
      }
    })
    data = data.map((item) => {
      return _.pick(item, '_id', 'title', 'category', 'author', 'up', 'like', 'status', 'visits', 'created', 'tags', 'gallery', 'comments')
    })
  } catch (e) {
    error = e.message
  }
  
  res.json({
    success: !error,
    data,
    error,
    pagination
  });
};
exports.show = async function (req, res) {
  let id = req.params.id;
  let data = null
  let error
  try {
    data = await contentService.findById(id, null, {
      populate: [{
        path: 'author',
        select: 'name avatar'
      }, {
        path: 'gallery',
        match: { type: /(image)|(video)/ },
        select: 'name url md_url sm_url type covers'
      }]
    });
    // console.log(data);
    data.visits = data.visits + 1;
    data.save();
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
  // let obj = req.body
  let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags');
  // TODO： 校验输入
  let user = req.user
  if (user) {
    obj.author = mongoose.Types.ObjectId(user._id)
  }
  let data = null
  let error
  try {
    data = await contentService.create(obj)
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
  let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags');
  // TODO： 校验输入
  let data = null
  let error
  try {
    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    let item = await contentService.findById(id)
    let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
    if (!isAdmin && !isAuthor) {
      error = '没有权限'
    } else {
      data = await contentService.findByIdAndUpdate(id, obj, { new: true })
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
    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    let item = await contentService.findById(id)
    let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
    if (!isAdmin && !isAuthor) {
      error = '没有权限'
    } else {
      data = await contentService.findByIdAndRemove(id)
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

exports.deleteBatch = async function(req, res) {
  const {ids} = req.body;
  let data = null
  let error
  try {
    let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
    if (!isAdmin) {
      error = '没有权限'
    } else {
      data = await contentService.remove({_id: {$in: ids}})
    }
  } catch(e) {
    error = e.message
  }
  res.json({
    success: !error,
    data,
    error,
  })
}
