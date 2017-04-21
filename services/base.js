'use strict';

let _ = require('lodash')

/**
 * 基础服务
 **/
let services = function(Model) {
    return {
        count: function(_condition) {
            let condition = _condition || {};
            return new Promise(function(resolve, reject) {
                Model.count(condition, function(err, total) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(total)
                    }
                })
            })
        },
        find: function(condition = {}, fields = null, options = {}) {
            return new Promise(function(resolve, reject) {
                Model.find(condition, fields, options, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            });
        },
        findOne: function(condition = {}, projection = null, options = {}) {
            return new Promise(function(resolve, reject) {
                Model.findOne(condition, projection, options, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result)
                    }
                })
            })
        },
        findById: function(id, populates = []) {
            return new Promise(function(resolve, reject) {
                let query = Model.findById(id)
                if (populates && populates.length > 0) {
                    populates.forEach(function(item) {
                        query = query.populate(item);
                    })
                }
                query.exec(function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                });
            })
        },
        create: function(obj) {
            return new Promise(function(resolve, reject) {
                let user = new Model(obj);
                user.save(function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                });
            })
        },
        update: function(condition = {}, doc = {}, options = {}) {
            return new Promise(function(resolve, reject) {
                Model.update(condition, doc, options, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            })
        },
        findOneAndUpdate: function(condition = {}, doc = {}, options = {}) {
    
        },
        findByIdAndUpdate: function(id, obj, options) {
            return new Promise(function(resolve, reject) {
                Model.findByIdAndUpdate(id, obj, options, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result);
                    }
                })
            })
        },
        updateById: function(id, obj, options) {
            return this.findByIdAndUpdate(id, obj, options)
        },
        remove: function(condition = {}) {
            return new Promise(function(resolve, reject) {
                Model.remove(condition, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            })
        },
        findOneAndRemove: function(condition) {
    
        },
        findByIdAndRemove: function(id, options = null) {
            return new Promise(function(resolve, reject) {
                Model.findByIdAndRemove(id, options, function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            })
        },
        removeById: function(id) {
            return this.findByIdAndRemove(id)
        },

    }
}

module.exports = services;