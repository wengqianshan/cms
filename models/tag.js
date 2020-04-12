'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let TagSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
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
TagSchema.methods = {

};

mongoose.model('Tag', TagSchema);
