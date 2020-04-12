'use strict';

let _ = require('lodash')
let mongoose = require('mongoose')
let RoleService = require('../../../services/role')
let roleService = new RoleService()
const Base = require('./base')

class RoleController extends Base {
  constructor(props) {
    super(props);
    this.service = roleService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: ['_id', 'name', 'actions', 'description'],
      item: ['_id', 'name', 'actions', 'description'],
      create: [],
      update: []
    };
  }

  async create(req, res) {
    let obj = _.pick(req.body, 'name', 'actions', 'description');

    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    // if not admin
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      let overAuth = _.difference(obj.actions, req.Actions);
      if (overAuth.length > 0) {
        return res.json({
          success: false,
          data: null,
          error: 'You have not permissions:' + overAuth.join(',')
        })
      }
    }

    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
      data = await roleService.create(obj)
    } catch (e) {
      // error = e.message
      error = 'system error'
    }
    res.json({
      success: !error,
      data: data,
      error: error
    })
  }

  async update(req, res) {
    let id = req.params.id
    let obj = _.pick(req.body, 'name', 'actions', 'description');

    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    // if not admin
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      let overAuth = _.difference(obj.actions, req.Actions);
      if (overAuth.length > 0) {
        return res.json({
          success: false,
          data: null,
          error: 'You have no permission:' + overAuth.join(',')
        })
      }
    }
    let data = null
    let error
    try {
      let isAdmin = req.isAdmin;
      let item = await roleService.findById(id)
      let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
      if (!isAdmin && !isAuthor) {
        error = 'no permission'
      } else {
        data = await roleService.findByIdAndUpdate(id, obj, { new: true })
      }

    } catch (e) {
      // error = e.message
      error = 'system error'
    }
    res.json({
      success: !error,
      data: data,
      error: error
    })
  }

}

module.exports = new RoleController()
