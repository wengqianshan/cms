'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 选项模型
 */
let OptionSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    value: {
        type: String
    },
    type: {
        type: String //user global system ...
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
OptionSchema.methods = {

};

mongoose.model('Option', OptionSchema);