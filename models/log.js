'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 标签模型
 */
let LogSchema = new Schema({
    type: {
        type: String
    },
    action: {
        type: String
    },
    status: {
        type: String
    },
    ip: {
        type: String
    },
    ua: {
        type: String
    },
    message: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});
LogSchema.methods = {

};

mongoose.model('Log', LogSchema);