'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let NotificationSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  from: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  to: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  // broadcast, only update read field, keep unread empty
  broadcast: {
    type: Boolean,
    default: false
  },
  // TODO:  feature
  type: {
    type: String,
    default: ''
  },
  read: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  unread: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  deleted: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Number,
    default: 0
  }
});

/*NotificationSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if (!this.title) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});*/
/*NotificationSchema.virtual('compare').set(function(password) {
    
}).get(function() {
    if (this.broadcast) {
        return this.read
    } else {
        return this.unread
    }
});*/

NotificationSchema.methods = {

};

mongoose.model('Notification', NotificationSchema);
