var express = require('express');
var router = express.Router();

var user = require('../../server/controllers/user');

/*router.get('/', function(req, res) {
    console.log(req.session)
    //req.session.user = '1111'
    if(req.session) {
        //req.session.destroy();
        //req.session.user = null;
        //delete req.session.user;
    }
    res.render('index', { title: 'CMS系统' });
});*/
//router.get('/list', content.list);
router.route('/').get(user.list);
router.route('/add').get(user.add).post(user.add);
router.route('/:id').get(user.one);


module.exports = function(app) {
    app.use('/user', router);
};
