'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let tag = require('../../controllers/server/tag')

router.use(function (req, res, next) {
  // console.log('tag: ' + Date.now());
  res.locals.Path = 'tag';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('TAG_INDEX'), tag.list);

router.route('/add').all(action.checkAction('TAG_CREATE'), tag.add);

router.route('/:id').get(action.checkAction('TAG_DETAIL'), tag.one);

router.route('/:id/edit').all(action.checkAction('TAG_UPDATE'), tag.edit);

router.route('/:id/del').post(action.checkAction('TAG_DELETE'), tag.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/tag');
  app.use(path, router);
};
