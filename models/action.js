'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 动作模型
 */
var ActionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    children: [{
        type: Schema.ObjectId,
        ref: 'Action'
    }],
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
ActionSchema.methods = {

};

mongoose.model('Action', ActionSchema);


//权限
[
    {
        name: 'POST',
        description: '内容',
        items: [
            {
                name: 'CREATE',
                description: '创建'
            }
        ]
    },{
        name: 'USER',
        description: '用户'
    }
]