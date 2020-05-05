'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ContentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  gallery: [
    {
      type: Schema.ObjectId,
      ref: "File",
    },
  ],
  author: {
    type: Schema.ObjectId,
    ref: "User",
  },
  category: {
    type: Schema.ObjectId,
    ref: "Category",
  },
  tags: [
    {
      type: Schema.ObjectId,
      ref: "Tag",
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
  visits: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: Schema.ObjectId,
      ref: "Comment",
    },
  ],
  status: {
    type: Number,
    default: 0,
  },
  like: {
    type: Number,
    default: 0,
  },
  // Top
  up: {
    type: Number,
    default: 0,
  },
  like: {
    type: Number,
    default: 0,
  },
});

/*ContentSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/

ContentSchema.methods = {

};

mongoose.model('Content', ContentSchema);
