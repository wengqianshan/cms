var express = require('express');
var router = express.Router();
var index = require('../../server/controllers/index');

//首页
router.get('/', index.index);
router.get('/me', index.me);
router.route('/install').get(index.install).post(index.install);

module.exports = function(app) {
    //app.use('/', router);
    var config = app.get('config');
    var path = (config.admin.dir ? '/' + config.admin.dir : '') + '/';
    app.use(path, router);
};
