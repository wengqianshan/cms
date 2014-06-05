var express = require('express');
var router = express.Router();

var content = require('../../server/controllers/content');

router.route('/').get(content.list);
router.route('/add').get(content.add).post(content.add);
router.route('/:id').get(content.one);
/*content.add({
    title: '唐诗三百首',
    content: '宋词呢'
});*/

module.exports = function(app) {
    app.use('/content', router);
};
