/**
 * 评论服务
 **/

'use strict';
var mongoose = require('mongoose'),
    _ = require('underscore'),
    config = require('../config'),
    core = require('../libs/core'),
    Comment = mongoose.model('Comment');