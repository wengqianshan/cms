var express = require('express');
var router = express.Router();
var index = require('../../server/controllers/index');
var user = require('../../server/controllers/user');

//首页
router.get('/', user.authenticate, index.index);

module.exports = function(app) {
    //app.use('/', router);
    var config = app.get('config');
    var path = (config.admin.dir ? '/' + config.admin.dir : '') + '/';
    app.use(path, router);
};
