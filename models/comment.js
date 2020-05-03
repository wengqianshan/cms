'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let CommentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  from: {
    type: Schema.ObjectId,
    ref: 'Content'
  },
  reply: {
    type: Schema.ObjectId,
    ref: 'Comment'
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  // guest user info
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
  ip: {
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
