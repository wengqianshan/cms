'use strict';

let express = require('express')
let router = express.Router()
let index = require('../../controllers/app/index')

//首页
router.route('/contact').all(index.contact);
router.route('/').all(index.index);

module.exports = function(app) {
    app.use('/', router);
};
