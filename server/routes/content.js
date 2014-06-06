var express = require('express');
var router = express.Router();

var content = require('../../server/controllers/content');

//添加内容
router.route('/add').get(content.add).post(content.add);
//单条信息
router.route('/:id').get(content.one);
//更新信息
router.route('/:id/edit').get(content.edit).post(content.edit);
//删除信息
router.route('/:id/del').get(content.del).post(content.del);
//内容列表
router.route('/').get(content.list);

module.exports = function(app) {
    app.use('/content', router);
};
