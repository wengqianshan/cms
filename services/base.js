'use strict';

/**
 * 基础服务
 **/
let services = function(Model) {
    return {
        count: function(condition) {
            let condition = condition || {};
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
        find: function(condition, populates) {
            let condition = condition || {};
            return new Promise(function(resolve, reject) {
                let query = Model.find(condition)
                if (populates && populates.length > 0) {
                    populates.forEach(function(item) {
                        query = query.populate(item);
                    })
                }
                query.exec(function(err, result) {
                    console.log(err, result)
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                });
            });
        },
        findOne: function(condition, projection, options) {
            let condition = condition || {};
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
        findById: function(id, populates) {
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
        update: function(condition, doc, options) {
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
        updateOne: function(condition, doc, options) {
    
        },
        updateById: function(id, obj, options) {
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
        delete: function(condition) {
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
        deleteOne: function(condition) {
    
        },
        deleteById: function(id) {
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

    }
}

module.exports = services;