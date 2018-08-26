'use strict';

let _ = require('lodash')

class Base {
    constructor(props) {
        for (let i in props) {
            this[i] = props[i];
        }
    }
    count(condition = {}) {
        return new Promise((resolve, reject) => {
            this.Model.count(condition, function (err, total) {
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
    create(obj) {
        return new Promise((resolve, reject) => {
            let user = new this.Model(obj);
            user.save(function (err, result) {
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
    findByIdAndUpdate(id, obj, options) {
        return new Promise((resolve, reject) => {
            this.Model.findByIdAndUpdate(id, obj, options, function (err, result) {
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
    findOneAndRemove(condition) {

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