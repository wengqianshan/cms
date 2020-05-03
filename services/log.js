/**
 * log
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Log = mongoose.model('Log');

let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = Log;
  }

  add(obj) {
    let data = _.pick(obj, 'type', 'action', 'name', 'qs', 'arg1', 'arg2', 'arg3', 'status', 'ip', 'ua', 'message', 'author');
    return this.create(data);
  }
}

module.exports = Service;
