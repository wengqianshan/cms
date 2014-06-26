'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 文件模型
 */
var FileSchema = new Schema({
    url: {
        type: String,
        unique: true
    },
    size: Number,
    type: String,
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
FileSchema.methods = {

};

mongoose.model('File', FileSchema);