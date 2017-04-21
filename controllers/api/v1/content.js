'use strict';

let core = require('../../../libs/core')
let contentService = require('../../../services/content')

exports.all = async function(req, res) {
    let condition = {}
    let pageInfo = {}
    let data = null
    let error
    try {
        let total = await contentService.count(condition)
        //分页
        pageInfo = core.createPage(req.query.page, total);

        data = await contentService.find(condition, null, {
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        })
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
        data = await contentService.findById(id)
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
        data = await contentService.create(obj)
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
        data = await contentService.findByIdAndUpdate(id, obj, {new: true})
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
        data = contentService.findByIdAndRemove(id)
    } catch (e) {
        error = e.message
    }
    res.json({
        success: !error,
        data: data,
        error: error
    })
}