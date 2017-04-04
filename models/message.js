'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 客户留言模型
 */
let MessageSchema = new Schema({
    name: {
        type: String,
        required: '请输入姓名'
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