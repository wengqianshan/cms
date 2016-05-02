/**
 * 页面服务
 **/

'use strict';
var mongoose = require('mongoose'),
    _ = require('underscore'),
    config = require('../config'),
    core = require('../libs/core'),
    Page = mongoose.model('Page');