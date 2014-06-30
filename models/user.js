'use strict';
var crypto = require('crypto');
var _ = require('underscore');
/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/*var securityCheck = function(type, user) {

};
securityCheck('createUser', user);*/

/**
 * 用户模型
 */
var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    gender: {
        type: String,
        enum: ['男', '女', '保密']
    },
    roles: [{
        type: Schema.ObjectId,
        ref: 'Role'
    }],
    //password: String,
    last_login_date: Date,
    last_login_ip: String,
    last_login_geo: String,
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
    },
    forget: {//找回密码
        hash: String,
        till: Date
    },
    salt: String,
    hashed_password: String
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Validations
 */
UserSchema.path('name').validate(function(name) {
    return (typeof name === 'string' && name.length > 0);
}, '名字不能为空');

UserSchema.path('email').validate(function(email) {
    return (typeof email === 'string' && email.length > 0);
}, 'Email不能为空');
UserSchema.path('email').validate(function(email) {
    return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email);
}, 'Email格式不正确');

UserSchema.path('username').validate(function(username) {
    return (typeof username === 'string' && username.length > 0);
}, '用户名不能为空');


/**
 * Pre-save hook
 */
/*UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && !this.provider)
        next(new Error('Invalid password'));
    else
        next();
});*/


/**
 * Methods
 */
UserSchema.methods = {

    /**
     * HasRole - check if the user has required role
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
     //通过角色名判断权限
    hasRole: function(role) {
        var roles = [];
        this.roles.forEach(function(item) {
            roles = _.union(roles, item.name);
        });
        return (roles.indexOf(role) !== -1);
    },
    //通过动作判断权限
    hasAction: function(action) {
        var actions = [];
        this.roles.forEach(function(item) {
            actions = _.union(actions, item.actions);
        });
        return (actions.indexOf(action) !== -1);
    },
    roleToObj: function() {
        var roles = [];
        var actions = [];
        this.roles.forEach(function(item) {
            roles = _.union(roles, item.name);
            actions = _.union(actions, item.actions);
        });
        return {
            _roles: roles,
            _actions: actions
        };
    },
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    hashPassword: function(password) {
        if (!password) return '';
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    }
};

mongoose.model('User', UserSchema);