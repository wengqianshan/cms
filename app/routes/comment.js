var express = require('express');
var router = express.Router();
var comment = require('../../app/controllers/comment');

//评论
router.route('/add').post(comment.add);
router.route('/:id').get(comment.one).delete(comment.del);

module.exports = function(app) {
    app.use('/comment', router);
};
