/**
 * 留言服务
 **/

'use strict';
var mongoose = require('mongoose'),
    _ = require('underscore'),
    config = require('../config'),
    core = require('../libs/core'),
    Message = mongoose.model('Message');