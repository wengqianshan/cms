'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let category = require('../../controllers/server/category')

router.use(function (req, res, next) {
  // console.log('category: ' + Date.now());
  res.locals.Path = 'category';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('CATEGORY_INDEX'), category.list);

router.route('/add').all(action.checkAction('CATEGORY_CREATE'), category.add);

router.route('/:id').get(action.checkAction('CATEGORY_DETAIL'), category.one);

router.route('/:id/edit').all(action.checkAction('CATEGORY_UPDATE'), category.edit);

router.route('/:id/del').post(action.checkAction('CATEGORY_DELETE'), category.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/category');
  app.use(path, router);
};
