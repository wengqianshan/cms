'use strict';

let jwt = require('jsonwebtoken')
let config = require('../config')
let util = require('../lib/util')
let UserService = require('../services/user')
let userService = new UserService()
let RoleService = require('../services/role')
let roleService = new RoleService()
let UserCache = {}
exports.verify = async function (req, res, next) {
  req.jwt = true;
  let token
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.body && req.body.token) {
    token = req.body.token;
  } else {
    return res.json({
      success: false,
      data: null,
      error: '缺少token'
    });
  }
  let data = null
  let error
  // 缓存用户信息，读取
  try {
    data = jwt.verify(token, config.jwt.secret)
    console.log(data, 'jwt decode ++++++++++++')
    let uid = data.user.id
    let version = data.user.token_version
    if (!UserCache[uid]) {
      let user = await userService.findById(uid)
      // TODO 已删除用户容错
      let roleArray = []
      if (user.roles && user.roles.length > 0) {
        for (let i = 0, len = user.roles.length; i < len; i++) {
          let item = user.roles[i]
          roleArray.push(await roleService.findById(item))
        }
      }
      user.roles = roleArray
      let roles = util.getRoles(user);
      let actions = util.getActions(user);
      req.Roles = roles;
      req.Actions = actions;
      req.user = user
      UserCache[uid] = user;
      //console.log(uid, user, '---------------------------')
    } else {
      console.log('已保存')
      let user = UserCache[uid]
      if (user.token_version !== version) {
        // token中途过期处理
        req.Roles = null
        req.Actions = null
        req.user = null
        UserCache[uid] = null
        data = null
        error = 'token过期，请重新登录'
        return
      }
      let roles = util.getRoles(user);
      let actions = util.getActions(user);
      //console.log(roles, actions, '----------------')
      req.Roles = roles;
      req.Actions = actions;
      req.user = user
    }

  } catch (e) {
    error = e.message
  }
  if (error) {
    return res.json({
      success: !error,
      data: data,
      error: error || '请登录后操作'
    });
  }
  next()
}
