'use strict';

let mongoose = require('mongoose')
let fs = require('fs')
let path = require('path')
let File = mongoose.model('File')
let _ = require('lodash')
let config = require('../../config')
let util = require('../../lib/util')

let FileService = require('../../services/file')
let fileService = new FileService()

const Uploader = require('../../lib/uploader');
const uploader = new Uploader();

exports.list = function (req, res) {
  //console.log(req.cookies['XSRF-TOKEN'])
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  File.count(condition, function (err, total) {
    let query = File.find(condition).populate('author');
    let pageInfo = util.createPage(req.query.page, total);
    // console.log(pageInfo)
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      // console.log(results)
      res.render('server/file/list', {
        files: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    });
  })
};

exports.one = function (req, res) {
  let id = req.params.id;
  File.findById(id).populate('author').exec(function (err, result) {
    // console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/file/item', {
      title: result.name,
      role: result
    });
  });
};

exports.add = async function (req, res) {
  if (req.method === 'GET') {
    res.render('server/file/add', {
      Menu: 'add'
    });
  } else if (req.method === 'POST') {
    let result = {};
    try {
      result = await fileService.upload(req.files.files, {
        author: req.session.user._id
      });
    } catch (e) {
      // console.log(e)
    }
    res.json(result);
  }
};

exports.edit = function (req, res) {
  if (req.method === 'GET') {
    let id = req.params.id;
    File.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      res.render('server/file/edit', {
        file: result
      });
    });
  } else if (req.method === 'POST') {
    let id = req.params.id;
    let obj = _.pick(req.body, 'url', 'md_url', 'sm_url', 'size', 'type', 'description');
    File.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      _.assign(result, obj);
      result.save(function (err, role) {
        res.render('server/info', {
          message: 'Success'
        });
      });
    });
  }
};

exports.del = async function (req, res) {
  const id = req.params.id;
  let data;
  let error;
  try {
    const file = await fileService.findById(id, null, {
      populate: [{
        path: 'author',
        select: '_id name avatar'
      }]
    });
    const isAdmin = req.isAdmin;
    const isAuthor = file.author && (file.author._id + '') === req.session.user._id + '';
    if (!isAdmin && !isAuthor) {
      error = 'no permission';
    } else {
      data = await fileService.del(id);
    }
  } catch (e) {
    error = e.message;
  }
  return res.json({
    success: !error,
    error: error,
    data: data
  });
};
