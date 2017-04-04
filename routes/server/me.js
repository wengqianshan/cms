'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let me = require('../../controllers/server/me')

//首页
router.use(function(req, res, next) {
    console.log('管理员信息: ' + Date.now());
    res.locals.Path = 'me';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});
router.get('/', me.init);
router.route('/edit').all(me.edit);
router.route('/updatepwd').all(me.updatePassword);

module.exports = function(app) {
    let path = core.translateAdminDir('/me');
    app.use(path, router);
};
