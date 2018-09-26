'use strict';

let _ = require('lodash');
let mongoose = require('mongoose');
let xss = require('xss');
let util = require('../../../lib/util');
let MessageService = require('../../../services/message');
let messageService = new MessageService();
const Base = require('./base')

class MessageController extends Base {
  constructor(props) {
    super(props);
    this.service = messageService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: ['_id', 'name', 'email', 'mobile', 'address', 'content', 'author', 'created', 'ip'],
      create: ['name', 'email', 'mobile', 'address', 'content'],
      update: ['name', 'email', 'mobile', 'address', 'content']
    };
  }

  async create(req, res) {
    let body = req.body;
    let obj = _.pick(body, 'name', 'email', 'mobile', 'address', 'content');
    obj.ip = util.getIp(req);
    obj.content = xss(obj.content);

    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data;
    let error;
    try {
      data = await messageService.create(obj);
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

module.exports = new MessageController()
