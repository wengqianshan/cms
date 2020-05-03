'use strict';

let _ = require('lodash')

exports.checkAction = function (actionName) {
  //console.log(actionName)
  return function (req, res, next) {
    // console.log('actions=> \n', req.Actions);
    const isAdmin = req.isAdmin;
    if (isAdmin) {
      return next();
    }
    let result = false;

    if (_.isArray(actionName)) {
      result = _.intersection(req.Actions, actionName).length === actionName.length;
    } else if (_.isString(actionName)) {
      result = req.Actions && req.Actions.indexOf(actionName) > -1;
    }
    if (result) {
      return next();
    } else {
      if (req.jwt) {
        return res.json({
          success: false,
          error: 'No Permission'
        })
      }

      if (req.xhr) {
        res.json({
          success: false,
          error: "No Permission",
        });
      } else {
        res.render("server/info", {
          message: "No Permission",
        });
      }
    }
  };
}
