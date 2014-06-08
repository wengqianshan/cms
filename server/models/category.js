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
    description: String,
    created: {
        type: Date,
        default: Date.now
    },
    status: String
});
CategorySchema.methods = {

};

mongoose.model('Category', CategorySchema);