'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let action = require('../../middlewares/action')
let comment = require('../../controllers/server/comment')

router.use(function (req, res, next) {
  // console.log('comment: ' + Date.now());
  res.locals.Path = 'comment';
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  next();
});

router.route('/').get(action.checkAction('COMMENT_INDEX'), comment.list);

router.route('/:id').get(action.checkAction('COMMENT_DETAIL'), comment.one);

router.route('/:id/del').post(action.checkAction('COMMENT_DELETE'), comment.del);

module.exports = function (app) {
  let path = util.translateAdminDir('/comment');
  app.use(path, router);
};
