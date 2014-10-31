var express = require('express');
var router = express.Router();
var content = require('../../controllers/app/content');

//
router.use(function(req, res, next) {
    res.locals.Path = 'content';
    next();
});
router.route('/').get(content.list);
router.route('/:id').get(content.one);

module.exports = function(app) {
    app.use('/content', router);
};
