'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 页面模型
 */
let PageSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    flag: {
        type: String
    },
    description: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

/*PageSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/

PageSchema.methods = {

};

mongoose.model('Page', PageSchema);