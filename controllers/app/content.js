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

exports.list = function (req, res) {
  let condition = {};
  let category = req.query.category;
  if (category) {
    condition.category = category;
  }
  Content.count(condition, function (err, total) {
    let query = Content.find(condition).populate('author', 'username name email');
    let pageInfo = util.createPage(req.query.page, total, 30);
    //console.log(pageInfo);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('app/content/list', {
        title: 'content list',
        contents: results,
        pageInfo: pageInfo
      });
    });
  });

};

exports.one = function (req, res) {
  let id = req.params.id;
  Content.findById(id).populate('author').populate('category').populate('comments').populate('gallery').exec(function (err, result) {
    // console.log(result);
    if (!result) {
      return res.render("app/info", {
        message: "Content does not exist",
      });
    }
    result.visits = result.visits + 1;
    result.save();

    const data = result.toJSON();
    let comments = data.comments;
    data.comments = comments.map((item) => {
      item.content = xss(md.render(item.content));
      return item;
    });
    res.render('app/content/item', {
      title: result.title,
      content: Object.assign(data, {
        content: xss(md.render(data.content))
      })
    });
  });
};
