'use strict';

let  mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Message = mongoose.model('Message')
let Category = mongoose.model('Category')
let _ = require('lodash')
let File = mongoose.model('File')
let config = require('../../config')
let core = require('../../libs/core')
let contentService = require('../../services/content')

exports.index = async function(req, res) {
    console.log('前台')
    let condition = {};
    
    let key = req.query.key;
    if(key) {
        console.log('关键字为', key);
        let _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
        let k = '[^\s]*' + _key + '[^\s]*';
        let reg = new RegExp(k, 'gi');
        condition.title = reg;
    }

    let pageInfo = {}
    let contents = []
    let newest = []
    let hotest = []
    let total
    let error
    try {
        total = await contentService.count(condition)
        pageInfo = core.createPage(req.query.page, total);
        contents = await contentService.find(condition, null, {
            skip: pageInfo.start,
            limit: pageInfo.pageSize,
            sort: {
                created: -1
            }
        })
        newest = await contentService.find(condition, null, {
            limit: 10,
            sort: {
                created: -1
            }
        })

        hotest = await contentService.find(condition, null, {
            limit: 10,
            sort: {
                visits: -1
            }
        })

    } catch (e) {
        error = '系统异常'
    }
    if (!error) {
        res.render('app/index', {
            contents: contents,
            pageInfo: pageInfo,
            key: key,
            total: total,
            newest: newest,
            hotest: hotest
        });
    } else {
        res.render('app/info', {
            message: '系统开小差了，请稍等'
        });
    }
};

exports.contact = function(req, res) {
    if(req.method === 'GET') {
        res.render('app/contact', {
            Path: 'contact'
        });
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'name', 'email', 'mobile', 'address', 'content');
        obj.ip = core.getIp(req);
        let contact = new Message(obj);
        contact.save(function(err, result) {
            console.log(err, result);
            if (err) {
                return res.render('app/info', {
                    message: err.message
                });
            } else {
                res.render('app/info', {
                    message: '提交成功'
                });
            }
        })
        
    }
    
}