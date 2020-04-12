'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let LogSchema = new Schema({
  type: {
    type: String
  },
  action: {
    type: String
  },
  name: {
    type: String
  },
  qs: {
    type: String
  },
  arg1: {
    type: String
  },
  arg2: {
    type: String
  },
  arg3: {
    type: String
  },
  status: {
    type: String
  },
  ip: {
    type: String
  },
  ua: {
    type: String
  },
  message: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
LogSchema.methods = {

};

mongoose.model('Log', LogSchema);
