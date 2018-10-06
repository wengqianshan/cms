'use strict';

let jwt = require('jsonwebtoken')
let config = require('../config')
let util = require('../lib/util')
let UserService = require('../services/user')
let userService = new UserService()
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
    console.log('jwt=> \n', data);
    let uid = data.user.id
    let version = data.user.token_version
    let user;
    // TODO 已删除用户容错
    // 用户读缓存 or 读取
    if (!UserCache[uid]) {
      user = await userService.findById(uid, null, {
        populate: ['roles']
      });
      UserCache[uid] = user;
    } else {
      user = UserCache[uid]
    }

    let roles = util.getRoles(user);
    let actions = util.getActions(user);
    req.isAdmin = user.status === 101;
    req.Roles = roles;
    req.Actions = actions;
    req.user = user
    // 用户版本更新，过期token
    if (user.token_version !== version) {
      // token中途过期处理
      req.Roles = null
      req.Actions = null
      req.user = null
      UserCache[uid] = null
      data = null
      error = 'token过期，请重新登录'
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
