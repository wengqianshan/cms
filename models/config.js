'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 配置信息模型
 */
var ConfigSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    value: {
        type: String
    },
    type: {
        type: String
    },
    description: String,
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: Number,
        default: 0
    }
});
ConfigSchema.methods = {

};

mongoose.model('Config', ConfigSchema);