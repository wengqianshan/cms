'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let MessageSchema = new Schema({
  name: {
    type: String,
    required: 'please input name'
  },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  address: {
    type: String
  },
  content: String,
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String
  },
  status: {
    type: Number,
    default: 0
  }
});
MessageSchema.methods = {

};

mongoose.model('Message', MessageSchema);
