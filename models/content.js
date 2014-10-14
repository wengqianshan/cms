'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 内容模型
 */
var ContentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    gallery: [{
        type: Schema.ObjectId,
        ref: 'File'
    }],
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    category: {
        type: Schema.ObjectId,
        ref: 'Category'
    },
    tags: [{
        type: Schema.ObjectId,
        ref: 'Tag'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    visits: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    status: {
        type: Number,
        default: 0
    },
    //喜欢
    like: {
        type: Number,
        default: 0
    },
    //置顶，权重由数值决定
    ding: {
        type: Number,
        default: 0
    },
    //点赞
    zan: {
        type: Number,
        default: 0
    },
    //踩
    cai: {
        type: Number,
        default: 0
    }
});

/*ContentSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/

ContentSchema.methods = {

};

mongoose.model('Content', ContentSchema);