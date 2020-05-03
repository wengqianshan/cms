'use strict';

let express = require('express')
let router = express.Router()
let tag = require("../../../controllers/api/v1/tag");
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
  .get(tag.item)
  .put(
    jwtMiddleWare.verify,
    action.checkAction("TAG_UPDATE"),
    tag.update
  )
  .delete(
    jwtMiddleWare.verify,
    action.checkAction("TAG_DELETE"),
    tag.delete
  );

router
  .route("/:id/update")
  .post(
    jwtMiddleWare.verify,
    action.checkAction("TAG_UPDATE"),
    tag.update
  );

router
  .route("/:id/destroy")
  .post(
    jwtMiddleWare.verify,
    action.checkAction("TAG_DELETE"),
    tag.delete
  );

router
  .route("/")
  .get(tag.list)
  .post(
    jwtMiddleWare.verify,
    action.checkAction("TAG_CREATE"),
    tag.create
  )
  .delete(
    jwtMiddleWare.verify,
    action.checkAction("TAG_DELETE"),
    tag.deleteBatch
  );


module.exports = function (app) {
  app.use("/api/v1/tag", router);
};
