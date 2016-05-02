/**
 * 标签服务
 **/

'use strict';
var mongoose = require('mongoose'),
    _ = require('underscore'),
    config = require('../config'),
    core = require('../libs/core'),
    Tag = mongoose.model('Tag');

/**
- 查询
  - 单个
  - Id
  - 批量
- 添加
- 更新
- 删除
 **/