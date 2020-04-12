'use strict';
let _ = require('lodash')
let mongoose = require('mongoose')

let LogService = require('../../../services/log')
let logService = new LogService()
const Base = require('./base')

class LogController extends Base {
  constructor(props) {
    super(props);
    this.service = logService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: [],
      create: ['name', 'qs', 'arg1', 'arg2', 'arg3', 'ip', 'ua', 'message'],
      update: []
    };
  }

  async add(req, res) {
    let obj = req.query;
    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
      data = await logService.add(obj)
    } catch (e) {
      // error = e.message
      error = 'system error'
    }
    res.status(200).end();
    // res.json({
    //   success: !error,
    //   data: data,
    //   error: error
    // })
  }
}

module.exports = new LogController()
