'use strict';

let mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Message = mongoose.model('Message')
let Category = mongoose.model('Category')
let _ = require('lodash')
let File = mongoose.model('File')
let strip = require('strip');
let MarkdownIt = require('markdown-it');
let md = new MarkdownIt({
  html: true
});
let config = require('../../config')
let util = require('../../lib/util')
let ContentService = require('../../services/content')
let contentService = new ContentService()
let notify = require('../../notify');

exports.index = async function (req, res) {
  let condition = {};
  let key = req.query.key;
  if (key) {
    let _key = key.replace(/([\(\)\[])/g, '\\$1');
    let k = '[^\s]*' + _key + '[^\s]*';
    let reg = new RegExp(k, 'gi');
    condition.title = reg;
  }

  try {
    let total = await contentService.count(condition)
    let pageInfo = util.createPage(req.query.page, total);
    let contents = await contentService.find(condition, null, {
      // populate: 'author gallery',
      populate: [{
        path: 'author',
        select: 'name avatar'
      }, {
        path: 'gallery',
        select: 'name url md_url sm_url type covers',
        // perDocumentLimit: 3,
      }],
      skip: pageInfo.start,
      limit: pageInfo.pageSize,
      sort: {
        up: -1,
        created: -1
      }
    })

    let newest = await contentService.find(condition, null, {
      limit: 10,
      sort: {
        created: -1
      }
    })

    let hotest = await contentService.find(condition, null, {
      limit: 10,
      sort: {
        visits: -1
      }
    })

    contents = contents.map((item) => {
      item.content = strip(md.render(item.content));
      return item;
    })
    res.render('app/index', {
      contents: contents,
      pageInfo: pageInfo,
      key: key,
      total: total,
      newest: newest,
      hotest: hotest
    });

  } catch (e) {
    console.log(e)
    res.render('app/info', {
      message: 'System Error'
    });
  }
};

exports.contact = function (req, res) {
  if (req.method === 'GET') {
    res.render('app/contact', {
      Path: 'contact'
    });
  } else if (req.method === 'POST') {
    let obj = _.pick(req.body, 'name', 'email', 'mobile', 'address', 'content');
    obj.ip = util.getIp(req);
    if (/http(s)?/.test(obj.content)) {
      return res.redirect('/')
    }
    notify.sendMessage(`Message: ${JSON.stringify(obj)}`);
    let contact = new Message(obj);
    contact.save(function (err, result) {
      // console.log(err, result);
      if (err) {
        return res.render('app/info', {
          message: err.message
        });
      } else {
        res.render('app/info', {
          message: 'Success'
        });
      }
    })

  }

}
