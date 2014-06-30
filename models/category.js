'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 分类模型
 */
var CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        unique: true
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    description: String,
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});
CategorySchema.methods = {

};

mongoose.model('Category', CategorySchema);