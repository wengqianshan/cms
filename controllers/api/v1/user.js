'use strict';

let mongoose = require('mongoose')
let _ = require('lodash')
let jwt = require('jsonwebtoken')
let core = require('../../../libs/core')
let userService = require('../../../services/user')
let roleService = require('../../../services/role')
let config = require('../../../config')

exports.auth = async function (req, res) {
    let ip = core.getIp(req);
    let obj = req.body
    let data = null
    let error
    try {
        let user = await userService.findOne({username: obj.username})
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

exports.verify = function (req, res, next) {
    let token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }
    let data = null
    let error
    try {
        data = jwt.verify(token, 'cms')
    } catch (e) {
        error = e.message
    }
    res.json({
        success: !error,
        data: data,
        error: error
    });
}

exports.all = async function(req, res) {
    //console.log(req.user, ' get user ++++++++++++++++')
    let condition = {}
    let pageInfo = {}
    let data = null
    let error
    try {
        let total = await userService.count(condition)
        //分页
        pageInfo = core.createPage(req.query.page, total);

        let users = await userService.find(condition, null, {
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        })
        data = users.map(function(item) {
            return _.pick(item, '_id', 'username', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'roles', 'rank', 'status')
        });
    } catch (e) {
        error = e.message
    }
    
    res.json({
        success: !error,
        data: data,
        error: error,
        pageInfo: pageInfo
    });

};
exports.show = async function(req, res) {
    let id = req.param('id');
    let data = null
    let error
    try {
        let result = await userService.findById(id)
        data = _.pick(result, '_id', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'roles', 'rank', 'status')
    } catch (e) {
        error = e.message
    }
    
    res.json({
        success: !error,
        data: data,
        error: error
    });
}

exports.create = async function(req, res) {
    let obj = req.body
    // TODO： 校验输入
    // 后台创建用户
    let user = req.user
    if (user) {
        obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
        let role = await roleService.findOne({status: 202})
        obj.roles = [role._id]
        data = await userService.create(obj)
    } catch (e) {
        //error = e.message
        error = '创建用户失败'
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })
}

exports.update = async function(req, res) {
    let id = req.param('id')
    let obj = req.body
    // TODO： 校验输入
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await userService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = await userService.findByIdAndUpdate(id, obj, {new: true})    
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

exports.destroy = async function(req, res) {
    let id = req.param('id')
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await userService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = userService.findByIdAndRemove(id)
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