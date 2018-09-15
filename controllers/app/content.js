'use strict';

let mongoose = require('mongoose')
let Comment = mongoose.model('Comment')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let util = require('../../lib/util')
let MarkdownIt = require('markdown-it');
let md = new MarkdownIt({
  html: true
});
let xss = require('xss');

//列表
exports.list = function (req, res) {
  let condition = {};
  let category = req.query.category;
  if (category) {
    condition.category = category;
  }
  //查数据总数
  Content.count(condition, function (err, total) {
    let query = Content.find(condition).populate('author', 'username name email');
    //分页
    let pageInfo = util.createPage(req.query.page, total, 30);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('app/content/list', {
        title: '内容列表',
        contents: results,
        pageInfo: pageInfo
      });
    });
  });

};
//单条
exports.one = function (req, res) {
  let id = req.params.id;
  Content.findById(id).populate('author').populate('category').populate('comments').populate('gallery').exec(function (err, result) {
    // console.log(result);
    if (!result) {
      return res.render('app/info', {
        message: '该内容不存在'
      });
    }
    result.visits = result.visits + 1;
    result.save();

    const data = result.toJSON();
    res.render('app/content/item', {
      title: result.title,
      content: Object.assign(data, {
        content: xss(md.render(data.content))
      })
    });
  });
};
