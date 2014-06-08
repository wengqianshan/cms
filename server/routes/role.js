var express = require('express');
var router = express.Router();

var role = require('../../server/controllers/role');

//添加内容
router.route('/add').get(role.add).post(role.add);
//单条信息
router.route('/:id').get(role.one);
//更新信息
router.route('/:id/edit').get(role.edit).post(role.edit);
//删除信息
router.route('/:id/del').get(role.del).post(role.del);
//内容列表
router.route('/').get(role.list);

module.exports = function(app) {
    app.use('/role', router);
};
