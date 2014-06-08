var express = require('express');
var router = express.Router();

var category = require('../../server/controllers/category');

//添加内容
router.route('/add').get(category.add).post(category.add);
//单条信息
router.route('/:id').get(category.one);
//更新信息
router.route('/:id/edit').get(category.edit).post(category.edit);
//删除信息
router.route('/:id/del').get(category.del).post(category.del);
//内容列表
router.route('/').get(category.list);

module.exports = function(app) {
    app.use('/category', router);
};
