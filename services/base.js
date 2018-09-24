'use strict';
// mongoose api https://mongoosejs.com/docs/api.html#model_Model.create

let _ = require('lodash')

class Base {
  constructor(props) {
    for (let i in props) {
      this[i] = props[i];
    }
  }
  count(filter = {}) {
    return new Promise((resolve, reject) => {
      this.Model.countDocuments(filter, function (err, total) {
        if (err) {
          reject(err)
        } else {
          resolve(total)
        }
      })
    })
  }

  find(condition = {}, fields = null, options = {}) {
    return new Promise((resolve, reject) => {
      this.Model.find(condition, fields, options, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    });
  }
  findOne(condition = {}, projection = null, options = {}) {
    return new Promise((resolve, reject) => {
      this.Model.findOne(condition, projection, options, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result)
        }
      })
    })
  }
  findById(id, projection, options) {
    return new Promise((resolve, reject) => {
      let query = this.Model.findById(id, projection, options);
      query.exec(function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    })
  }
  create(doc) {
    return new Promise((resolve, reject) => {
      let model = new this.Model(doc);
      model.save(function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    })
  }
  update(condition = {}, doc = {}, options = {}) {
    return new Promise((resolve, reject) => {
      this.Model.update(condition, doc, options, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  findOneAndUpdate(condition = {}, doc = {}, options = {}) {

  }
  findByIdAndUpdate(id, update, options) {
    return new Promise((resolve, reject) => {
      this.Model.findByIdAndUpdate(id, update, options, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      })
    })
  }
  updateById(id, obj, options) {
    return this.findByIdAndUpdate(id, obj, options)
  }
  remove(condition = {}) {
    return new Promise((resolve, reject) => {
      this.Model.remove(condition, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  findOneAndRemove(conditions, options) {

  }
  findByIdAndRemove(id, options = null) {
    return new Promise((resolve, reject) => {
      this.Model.findByIdAndRemove(id, options, function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
  removeById(id) {
    return this.findByIdAndRemove(id)
  }
}

module.exports = Base;
