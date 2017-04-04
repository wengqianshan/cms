'use strict';

let express = require('express')
let router = express.Router()
let page = require('../../controllers/app/page')

//首页
router.route('/:id').all(page.one);
router.route('/').all(page.list);

module.exports = function(app) {
    app.use('/page', router);
};
