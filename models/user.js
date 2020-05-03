'use strict';

let crypto = require('crypto')
let _ = require('lodash')
let mongoose = require('mongoose')
let Schema = mongoose.Schema

let UserSchema = new Schema({
  username: {
    type: String,
    required: 'please input username',
    unique: true
  },

  email: {
    type: String,
    required: 'please input email',
    unique: true
  },

  mobile: {
    type: String
  },

  name: {
    type: String,
  },

  avatar: {
    type: String
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'secret']
  },

  birthday: {
    type: Date,
    default: Date.now
  },

  description: {
    type: String
  },

  address: {
    type: String
  },



  roles: [{
    type: Schema.ObjectId,
    ref: 'Role'
  }],

  last_login_date: Date,

  last_login_ip: String,

  position: {
    type: Array,
    index: '2dsphere'
  },

  reg_ip: String,

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

  rank: {
    type: Number,
    default: 0
  },

  forget: {
    hash: String,
    till: Date
  },

  questions: [{
    q: String,
    a: String
  }],

  salt: String,

  hashed_password: String,
  activeKey: String,
  isActive: {
    type: Boolean,
    default: false
  },
  token: String,
  // update value after change password
  token_version: {
    type: Number,
    default: 0
  }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function () {
  return this._password;
});

UserSchema.path('email').validate(function (email) {
  return (typeof email === 'string' && email.length > 0);
}, 'Email can not empty');
UserSchema.path('email').validate(function (email) {
  return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email);
}, 'Email invalid');

UserSchema.path("username").validate(function (username) {
  return (
    typeof username === "string" &&
    username.length >= 4 &&
    username.length <= 20
  );
}, "User name must be 4-20 character");
UserSchema.path('username').validate(function (username) {
  return /^\w+$/.test(username);
}, 'username role: a-zA-Z0-9_');


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
  hasRole: function (role) {
    let roles = [];
    this.roles.forEach(function (item) {
      roles = _.union(roles, item.name);
    });
    return (roles.indexOf(role) !== -1);
  },
  hasAction: function (action) {
    let actions = [];
    this.roles.forEach(function (item) {
      actions = _.union(actions, item.actions);
    });
    return (actions.indexOf(action) !== -1);
  },
  roleToObj: function () {
    let roles = [];
    let actions = [];
    this.roles.forEach(function (item) {
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
  authenticate: function (plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },
  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },
  hashPassword: function (password) {
    if (!password) return '';
    let encrypred;
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
      return encrypred;
    } catch (err) {
      return '';
    }
  }
};

mongoose.model('User', UserSchema);
