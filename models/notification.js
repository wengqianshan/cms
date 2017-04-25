'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 通知模型
 */
let NotificationSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    from: {//发送人
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: [{//接收人
        type: Schema.ObjectId,
        ref: 'User'
    }],
    // 是否系统广播，系统广播只更新read字段, unread默认为全员
    broadcast: {
        type: Boolean,
        default: false
    },
    // TODO 提醒类型，比如有人看了给你的帖子点赞，有人加你为好友等，待开发
    type: {
        type: String,
        default: ''
    },
    // 已读用户
    read: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    // 未读用户
    unread: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    // 已删除用户
    deleted: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

/*NotificationSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/
/*NotificationSchema.virtual('compare').set(function(password) {
    
}).get(function() {
    if (this.broadcast) {
        return this.read
    } else {
        return this.unread
    }
});*/

NotificationSchema.methods = {

};

mongoose.model('Notification', NotificationSchema);