var express = require('express');
var router = express.Router();

var content = require('../../server/controllers/content');

//添加内容
router.route('/add').get(content.add).post(content.add);
//单条信息
router.route('/:id').get(content.one);
//内容列表
router.route('/').get(content.list);

module.exports = function(app) {
    app.use('/content', router);
};
