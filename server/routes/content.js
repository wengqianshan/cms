var express = require('express');
var router = express.Router();

var content = require('../../server/controllers/content');

/* GET home page. */
router.get('/', function(req, res) {
    console.log(req.session)
    //req.session.user = '1111'
    if(req.session) {
        //req.session.destroy();
        //req.session.user = null;
        //delete req.session.user;
    }
    res.render('index', { title: 'CMS系统' });
});
router.route('/content').get(content.list);
router.route('/content/add').get(content.add).post(content.add);
router.route('/content/:id').get(content.one);
/*content.add({
    title: '唐诗三百首',
    content: '宋词呢'
});*/

router.get('/out', function(req, res) {
    if(req.session) {
        req.session.destroy();
    }
    console.log(req.session);
})

module.exports = function(app) {
    app.use('/', router);
};
