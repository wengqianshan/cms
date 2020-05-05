'use strict';

let _ = require('lodash')
let mongoose = require('mongoose')
let $page = require('../../../lib/page')

/**
 * populate {list item}
 */

/**
 * props:
 * service
 * populate
 *  list
 *  item
 * fields
 *  list
 *  create
 *  update
 * 
 */

class BaseController {
  constructor() {
    this.service = null;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: [],
      create: [],
      update: []
    };
    this.list = this.list.bind(this);
    this.item = this.item.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteBatch = this.deleteBatch.bind(this);
  }
  async list(req, res) {
    let condition = {}
    const query = req.query;
    if (query.s) {
      condition.title = new RegExp(query.s, 'gi');
    }
    let { current, pageSize } = $page.parse(query);
    let pagination;

    let data
    let error
    try {
      let total = await this.service.count(condition)
      pagination = {
        current,
        pageSize,
        total,
      };
      data = await this.service.find(condition, null, {
        populate: this.populates.list,
        skip: pageSize * (current - 1),
        limit: pageSize,
        sort: {
          up: -1,
          created: -1,
        },
      });
      if (this.fields.list.length) {
        data = data.map((item) => {
          return _.pick(item, this.fields.list)
        })
      }
      
    } catch (e) {
      error = e.message
    }

    res.json({
      success: !error,
      data,
      error,
      pagination
    });
  }

  async item(req, res) {
    let id = req.params.id;
    let data = null
    let error
    try {
      data = await this.service.findById(id, null, {
        populate: this.populates.item
      });
      // console.log(data);
      data.visits = data.visits + 1;
      data.save();
    } catch (e) {
      // error = e.message
      error = 'system error'
    }

    res.json({
      success: !error,
      data: data,
      error: error
    });
  }

  async create(req, res) {
    let obj = _.pick(req.body, this.fields.create);
    // TODO： validation
    let user = req.user
    if (user) {
      obj.author = mongoose.Types.ObjectId(user._id)
    }
    let data = null
    let error
    try {
      data = await this.service.create(obj)
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
    // let obj = req.body
    let obj = _.pick(req.body, this.fields.update);
    // TODO： validation
    let data = null
    let error
    try {
      let isAdmin = req.isAdmin;
      let item = await this.service.findById(id)
      let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
      if (!isAdmin && !isAuthor) {
        error = 'no permission';
      } else {
        data = await this.service.findByIdAndUpdate(id, obj, { new: true })
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

  async delete(req, res) {
    let id = req.params.id
    let data = null
    let error
    try {
      let isAdmin = req.isAdmin;
      let item = await this.service.findById(id)
      let isAuthor = !!(item.author && ((item.author + '') === (req.user._id + '')))
      if (!isAdmin && !isAuthor) {
        error = "no permission";
      } else {
        data = await this.service.findByIdAndRemove(id)
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

  async deleteBatch(req, res) {
    const { ids } = req.body;
    let data = null
    let error
    try {
      let isAdmin = req.isAdmin;
      if (!isAdmin) {
        error = "no permission";
      } else {
        data = await this.service.remove({ _id: { $in: ids } })
      }
    } catch (e) {
      error = e.message
    }
    res.json({
      success: !error,
      data,
      error,
    })
  }
}

module.exports = BaseController;
