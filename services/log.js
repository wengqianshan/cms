/**
 * 页面服务
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Log = mongoose.model('Log');


let baseServices = require('./base')(Log);

let services = {
    add: function(obj) {
        return this.create(_.pick(obj, 'type', 'action', 'status', 'ip', 'ua', 'message', 'author'));
    }
};

module.exports = _.assign({}, baseServices, services);