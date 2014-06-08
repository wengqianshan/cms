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
        required: true
    },
    actions: Array,//['read', 'write', 'guest', 'createUser']
    description: String,
    created: {
        type: Date,
        default: Date.now
    },
    status: String
});
RoleSchema.methods = {

};

mongoose.model('Role', RoleSchema);