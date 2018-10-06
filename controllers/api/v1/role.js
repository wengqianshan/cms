'use strict';

let _ = require('lodash')
let mongoose = require('mongoose')
let RoleService = require('../../../services/role')
let roleService = new RoleService()
const Base = require('./base')

class RoleController extends Base {
  constructor(props) {
    super(props);
    this.service = roleService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: ['_id', 'name', 'actions', 'description'],
      item: ['_id', 'name', 'actions', 'description'], // todo: base 暂不支持
      create: [],
      update: []
    };
  }

  async create(req, res) {
    let obj = _.pick(req.body, 'name', 'actions', 'description');

    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    //如果不是管理员，检查是否超出权限
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      let overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
      if (overAuth.length > 0) {
        return res.json({
          success: false,
          data: null,
          error: '你不能操作如下权限:' + overAuth.join(',')
        })
      }
    }

    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
      data = await roleService.create(obj)
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

  async update(req, res) {
    let id = req.params.id
    let obj = _.pick(req.body, 'name', 'actions', 'description');

    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    //如果不是管理员，检查是否超出权限
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      let overAuth = _.difference(obj.actions, req.Actions);//返回第一个参数不同于第二个参数的条目
      if (overAuth.length > 0) {
        return res.json({
          success: false,
          data: null,
          error: '你不能操作如下权限:' + overAuth.join(',')
        })
      }
    }
    let data = null
    let error
    try {
      let isAdmin = req.isAdmin;
      let item = await roleService.findById(id)
      let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
      if (!isAdmin && !isAuthor) {
        error = '没有权限'
      } else {
        data = await roleService.findByIdAndUpdate(id, obj, { new: true })
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

}

module.exports = new RoleController()
