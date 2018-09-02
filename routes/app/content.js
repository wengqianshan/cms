'use strict';

let express = require('express')
let router = express.Router()
let content = require('../../controllers/app/content')

//
router.use(function (req, res, next) {
  res.locals.Path = 'content';
  next();
});
router.route('/').get(content.list);
router.route('/:id').get(content.one);

module.exports = function (app) {
  app.use('/content', router);
};
