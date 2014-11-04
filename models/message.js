'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 客户留言模型
 */
var MessageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String
    },
    content: String,
    created: {
        type: Date,
        default: Date.now
    },
    ip: {//用户ip
        type: String
    },
    status: {
        type: Number,
        default: 0
    }
});
MessageSchema.methods = {

};

mongoose.model('Message', MessageSchema);