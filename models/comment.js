'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 评论模型
 */
let CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    from: {//文章id
        type: Schema.ObjectId,
        ref: 'Content'
    },
    reply: {//回复评论的id
        type: Schema.ObjectId,
        ref: 'Comment'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    //匿名用户信息
    name: {
        type: String
    },
    email: {
        type: String
    },
    website: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    ip: {//回复ip
        type: String
    },
    status: {
        type: Number,
        default: 0
    }
});

/*CommentSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/

CommentSchema.methods = {

};

mongoose.model('Comment', CommentSchema);