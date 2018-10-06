'use strict';

let mongoose = require('mongoose')
let _ = require('lodash')
let jwt = require('jsonwebtoken')
let util = require('../../../lib/util')
let UserService = require('../../../services/user')
let userService = new UserService()
let RoleService = require('../../../services/role')
let roleService = new RoleService();
let config = require('../../../config')
const Base = require('./base')

class UserController extends Base {
  constructor(props) {
    super(props);
    this.service = userService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: ['_id', 'username', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'roles', 'rank', 'status'],
      item: ['_id', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'roles', 'rank', 'status'], // todo: 暂无实现
      create: [],
      update: []
    };
  }

  async auth(req, res) {
    let ip = util.getIp(req);
    let obj = req.body
    let data = null
    let error
    try {
      let user = await userService.findOne({ username: obj.username })
      console.log(user)
      if (user && user.authenticate(obj.password)) {
        user.last_login_date = new Date()
        user.last_login_ip = ip
        user.token = jwt.sign({
          user: {
            id: user._id,
            token_version: user.token_version
          }
        }, config.jwt.secret, config.jwt.options);
        user.save()
        data = _.pick(user, '_id', 'username', 'token')
      } else {
        error = '用户名或密码错误'
      }
    } catch (e) {
      // error = e.message
      error = '请先登录'
    }

    res.json({
      success: !error,
      data: data,
      error: error
    });
  }

  verify(req, res) {
    let token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }
    let data = null
    let error
    try {
      data = jwt.verify(token, config.jwt.secret)
    } catch (e) {
      // error = e.message
      error = '校验失败'
    }
    res.json({
      success: !error,
      data: data,
      error: error
    });
  }

  async create(req, res) {
    let obj = _.pick(req.body, 'username', 'password', 'email', 'mobile', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'position', 'questions');
    // TODO： 校验输入
    // 后台创建用户
    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
      let role = await roleService.findOne({ status: 202 })
      obj.roles = [role._id]
      obj.reg_ip = util.getIp(req)
      data = await userService.create(obj)
    } catch (e) {
      error = e.message
    }
    res.json({
      success: !error,
      data: data,
      error: error
    })
  }

  async update(req, res) {
    let id = req.params.id
    //let obj = req.body
    let obj = _.pick(req.body, 'username', 'email', 'mobile', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'position', 'questions', 'roles');
    // TODO： 校验输入
    let data = null
    let error
    try {
      let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
      let item = await userService.findById(id);
      let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
      let isMine = (item._id + '') === (req.user._id + '')
      // 校验是否有分配角色权限 roles 值为id
      // const roles = req.Roles;
      // const inputRoles = _.difference(obj.roles, roles);
      // const overAuth = inputRoles.length > 0;
      // console.log(obj.roles, roles, '----------');
      // console.log(inputRoles, overAuth, '++++++');
      if (!isAdmin && !isAuthor && !isMine) {
        error = '没有权限'
      } else {
        data = await userService.findByIdAndUpdate(id, obj, { new: true })
      }
    } catch (e) {
      error = e.message
    }
    res.json({
      success: !error,
      data: data,
      error: error
    })
  }

  
}

module.exports = new UserController()
