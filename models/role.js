'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 角色模型
 */
var RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    actions: Array,//['read', 'write', 'guest', 'createUser']
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
RoleSchema.methods = {

};

mongoose.model('Role', RoleSchema);