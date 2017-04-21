'use strict';

let _ = require('lodash')
let core = require('../../../libs/core')
let userService = require('../../../services/user')
let roleService = require('../../../services/role')

exports.all = async function(req, res) {
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
        data = _.pick(result, '_id', 'username', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'roles', 'rank', 'status')
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
    let data = null
    let error
    try {
        let role = await roleService.findOne({status: 202})
        obj.roles = [role._id]
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

exports.update = async function(req, res) {
    let id = req.param('id')
    let obj = req.body
    let data = null
    let error
    try {
        data = await userService.findByIdAndUpdate(id, obj, {new: true})
    } catch (e) {
        error = e.message
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })
}

exports.destroy = function(req, res) {
    let id = req.param('id')
    let data = null
    let error
    try {
        data = userService.findByIdAndRemove(id)
    } catch (e) {
        error = e.message
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })

}