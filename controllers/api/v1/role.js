'use strict';

let _ = require('lodash')
let mongoose = require('mongoose')
let core = require('../../../libs/core')
let roleService = require('../../../services/role')

exports.all = async function(req, res) {
    let condition = {}
    let pageInfo = {}
    let data = null
    let error
    try {
        let total = await roleService.count(condition)
        //分页
        pageInfo = core.createPage(req.query.page, total);

        data = await roleService.find(condition, null, {
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        })
        data = data.map((item) => {
            return _.pick(item, '_id', 'name', 'actions', 'description')
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
exports.show = async function(req, res) {
    let id = req.params.id;
    let data = null
    let error
    try {
        data = await roleService.findById(id)
        data = _.pick(data, '_id', 'name', 'actions', 'description')
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

exports.create = async function(req, res) {
    // let obj = req.body
    let obj = _.pick(req.body, 'name', 'actions', 'description');
    // TODO： 校验输入
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

exports.update = async function(req, res) {
    let id = req.params.id
    // let obj = req.body
    let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags');
    // TODO： 校验输入
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await roleService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = await roleService.findByIdAndUpdate(id, obj, {new: true})
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

exports.destroy = async function(req, res) {
    let id = req.params.id
    let data = null
    let error
    try {
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let item = await roleService.findById(id)
        let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
        if(!isAdmin && !isAuthor) {
            error = '没有权限'
        } else {
            data = roleService.findByIdAndRemove(id)
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