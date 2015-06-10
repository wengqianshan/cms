var express = require('express');
var router = express.Router();
var user = require('../../controllers/api/user');

//
router.use(function(req, res, next) {
    console.log('api: ' + Date.now());
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/users').all(user.list);
router.route('/users/:id').all(user.item);

module.exports = function(app) {
    app.use('/api', router);
};
