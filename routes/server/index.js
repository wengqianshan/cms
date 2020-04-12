'use strict';

let express = require('express')
let router = express.Router()
let util = require('../../lib/util')
let index = require('../../controllers/server/index')

router.use(function (req, res, next) {
  console.log('index: ' + Date.now());
  res.locals.Path = 'index';
  next();
});
router.get('/', index.index);
router.route('/install').all(index.install);

module.exports = function (app) {
  let path = util.translateAdminDir('/');
  app.use(path, router);
};
