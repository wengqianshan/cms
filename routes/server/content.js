'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let content = require('../../controllers/server/content')

router.use(function (req, res, next) {
  console.log('content: ' + Date.now());
  res.locals.Path = 'content';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});


router.route('/').get(action.checkAction('CONTENT_INDEX'), content.list);

router.route('/add').all(action.checkAction('CONTENT_CREATE'), content.add);

router.route('/:id/edit').all(action.checkAction('CONTENT_UPDATE'), content.edit);

router.route('/:id/del').post(action.checkAction('CONTENT_DELETE'), content.del);


module.exports = function (app) {
  let path = util.translateAdminDir('/content');
  app.use(path, router);
};
