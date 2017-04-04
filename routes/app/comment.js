'use strict';

let express = require('express')
let router = express.Router()
let comment = require('../../controllers/app/comment')

//评论
router.use(function(req, res, next) {
    res.locals.Path = 'comment';
    next();
});
router.route('/').get(comment.list);
router.route('/add').post(comment.add);
router.route('/:id').get(comment.one).delete(comment.del);

module.exports = function(app) {
    app.use('/comment', router);
};
