'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let Role = mongoose.model('Role')
let userController = require('./user')
let _ = require('lodash')
let config = require('../../config')
let util = require('../../lib/util')
const ACTIONS = require('../../actions')

exports.init = function (req, res) {
  let id = req.session.user._id;
  User.findById(id).populate('roles').exec(function (err, user) {
    if (!user) {
      return res.render('server/info', {
        message: 'System Error'
      });
    }

    let actions = [];
    const isAdmin = req.isAdmin;
    if (isAdmin) {
      actions = ACTIONS;
    } else {
      actions = ACTIONS.filter(function (item) {
        let items = item.actions.filter(function (act) {
          return req.Actions.indexOf(act.value) > -1;
        });
        if (items.length > 0) {
          return item;
        }
      })
    }
    res.render('server/me/item', {
      title: 'Profile',
      user: user,
      ACTIONS: actions
    });
  });
};

exports.edit = function (req, res) {
  let id = req.session.user._id;
  if (req.method === 'GET') {
    User.findById(id).populate('roles').exec(function (err, user) {
      let data = _.pick(user, 'name', 'mobile', 'gender', 'birthday');
      res.render('server/me/edit', {
        title: 'Profile Edit',
        user: data
      });
    });
  } else if (req.method === 'POST') {
    let obj = req.body;
    User.findById(id).populate('roles').exec(function (err, user) {
      _.assign(user, _.pick(obj, 'name', 'mobile', 'gender', 'birthday'));
      user.save(function (err, result) {
        console.log(err, result);
        if (err || !result) {
          return res.render('server/info', {
            message: 'Failure'
          });
        }
        req.session.user = result;
        res.locals.User = user;
        res.render('server/info', {
          message: 'Success'
        });
      })
    });
  }
};

exports.updatePassword = function (req, res) {
  if (req.method === 'GET') {

  } else if (req.method === 'POST') {
    let obj = req.body;
    let oldPassword = obj.oldpassword;
    let password = obj.password;
    let id = req.session.user._id;
    User.findById(id).exec(function (err, user) {
      if (user.authenticate(oldPassword)) {
        user.password = password;
        user.token_version++;
        user.save(function (err, result) {
          //console.log('fffffffffffff', result);
          userController.reload(result._id, function (err, user) {
            req.session.user = user;
            res.locals.User = user;
            res.render('server/info', {
              message: 'Success'
            });
          });
        });
      } else {
        res.render("server/info", {
          message: "Old assword is incorrect",
        });
      }
    });
  }
};
