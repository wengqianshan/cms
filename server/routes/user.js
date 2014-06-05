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

router.route('/login').get(user.login).post(user.login);
router.route('/register').get(user.register).post(user.register);
router.route('/logout').get(user.logout);
router.route('/:id').get(user.one);
router.route('/').get(user.authenticate, user.list);


module.exports = function(app) {
    app.use('/user', router);
};
