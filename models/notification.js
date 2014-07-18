'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 通知模型
 */
var NotificationSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    from: {//发送人
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {//接收人
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

/*NotificationSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/

NotificationSchema.methods = {

};

mongoose.model('Notification', NotificationSchema);