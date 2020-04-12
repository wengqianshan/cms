'use strict';

let express = require('express')
let router = express.Router()
let category = require("../../../controllers/api/v1/category");
let jwtMiddleWare = require('../../../middlewares/jwt')
let action = require('../../../middlewares/action')

//
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Request-With,content-type,Authorization')
  next();
});

router
  .route("/:id")
  .get(category.item)
  .put(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_UPDATE"),
    category.update
  )
  .delete(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_DELETE"),
    category.delete
  );

router
  .route("/:id/update")
  .post(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_UPDATE"),
    category.update
  );

router
  .route("/:id/destroy")
  .post(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_DELETE"),
    category.delete
  );

router
  .route("/")
  .get(category.list)
  .post(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_CREATE"),
    category.create
  )
  .delete(
    jwtMiddleWare.verify,
    action.checkAction("CATEGORY_DELETE"),
    category.deleteBatch
  );

module.exports = function (app) {
  app.use("/api/v1/category", router);
};
