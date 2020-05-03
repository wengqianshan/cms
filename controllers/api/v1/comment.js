'use strict';

let _ = require('lodash');
let mongoose = require('mongoose');
let xss = require('xss');
let util = require('../../../lib/util');
let CommentService = require('../../../services/comment');
let ContentService = require('../../../services/content');
let commentService = new CommentService();
let contentService = new ContentService();
const Base = require('./base');

class CommentController extends Base {
  constructor(props) {
    super(props);
    this.service = commentService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: ['_id', 'content', 'from', 'reply', 'name', 'email', 'website', 'comments'],
      create: ['content', 'from', 'reply', 'name', 'email', 'website'], // todo: more field > 'id', 'content', 'created', 'name', 'email', 'reply', 'from', 'ip'
      update: ['content', 'name', 'email', 'website']
    };
  }

  async create(req, res){
    let body = req.body;
    // console.log(body);
    if (!body.from) {
      return res.json({
        success: false,
        data: null,
        error: "param required: from",
      });
    }
    let obj = _.pick(body, 'content', 'from', 'reply', 'name', 'email', 'website');
    obj.ip = util.getIp(req);
    obj.content = xss(obj.content);

    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data;
    let error;
    try {
      let postItem = await contentService.findById(obj.from);
      let saveResult = await this.service.create(obj);
      if (!postItem.comments) {
        postItem.comments = [];
      }
      if (saveResult._id) {
        postItem.comments.push(saveResult._id);
        postItem.save();
      }
      if (obj.reply) {
        let parent = await this.service.findById(obj.reply);
        if (!parent.comments) {
          parent.comments = [];
        }
        if (saveResult._id) {
          parent.comments.push(saveResult._id);
          parent.save();
        }
      }
      data = _.assign({}, _.pick(saveResult, 'id', 'content', 'created', 'name', 'email', 'reply', 'from', 'ip'));
    } catch (e) {
      // console.log(e);
      error = e.message;
    }
    res.json({
      success: !error,
      data: data,
      error: error
    });
  }
}

module.exports = new CommentController()
