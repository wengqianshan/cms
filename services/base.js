/**
 * 基础服务
 **/
var services = function(Model) {
    return {
        find: function(condition, populates) {
            var condition = condition || {};
                return new Promise(function(resolve, reject) {
                    var query = Model.find(condition)
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
        findOne: function() {

        },
        findById: function(id, populates) {
            return new Promise(function(resolve, reject) {
                var query = Model.findById(id)
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
                var user = new Model(obj);
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