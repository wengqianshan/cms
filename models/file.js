'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let FileSchema = new Schema({
  name: {
    type: String
  },
  url: {
    type: String
  },
  md_url: {
    type: String
  },
  sm_url: {
    type: String
  },
  covers: Array,
  size: Number,
  type: String,
  description: String,
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.ObjectId,
    ref: "User"
  },
  status: {
    type: Number,
    default: 0
  },
  md5: String,
  width: Number,
  height: Number
});
FileSchema.methods = {

};

mongoose.model('File', FileSchema);
