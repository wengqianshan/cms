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
    value: Number,
    action: Array,//['read', 'write', 'guest', 'createUser']
    description: String,
    created: Date,
    status: String
});
RoleSchema.methods = {

};

mongoose.model('Role', RoleSchema);