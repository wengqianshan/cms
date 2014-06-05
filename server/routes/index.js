var express = require('express');
var router = express.Router();
var user = require('../../server/controllers/user');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'CMS系统' });
});

/*router.get('/logout', function(req, res) {
    if(req.session) {
        req.session.destroy();
    }
    console.log(req.session);
})*/

module.exports = function(app) {
    app.use('/', router);
};
