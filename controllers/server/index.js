'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let Comment = mongoose.model('Comment')
let File = mongoose.model('File')
let Role = mongoose.model('Role')
let userController = require('./user')
let config = require('../../config')
let util = require('../../lib/util')

exports.index = function (req, res) {
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  }
  let obj = {}
  let filter = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    filter = { author: req.session.user._id };
  }
  Promise.all([
    Content.find(filter).count().exec(),
    Category.find(filter).count().exec(),
    Comment.find(filter).count().exec(),
    User.find(filter).count().exec(),
    Role.find(filter).count().exec(),
    File.find(filter).count().exec()
  ]).then((result) => {
    //console.log(result)
    res.render('server/index', {
      title: 'Admin Dashboard',
      data: {
        content: result[0],
        category: result[1],
        comment: result[2],
        user: result[3],
        role: result[4],
        file: result[5]
      }
    });
  }).catch((e) => {

  })
};

// admin init
exports.install = function (req, res) {
  if (req.session.user) {
    let path = util.translateAdminDir('');
    return res.redirect(path);
  }
  // check user exist
  User.find({}, function (err, results) {
    console.log(err, results);
    if (err) {
      return;
    }
    if (results.length < 1) {
      if (req.method === 'GET') {
        res.render('server/install', {
          title: 'init'
        });
      } else if (req.method === 'POST') {
        let createUser = function (obj) {
          let user = new User(obj);
          user.save(function () {
            res.render('server/info', {
              message: 'init complete'
            });
          });
        };
        let obj = req.body;
        obj.status = 101; // admin user
        // check role
        Role.find({ status: 201 }, function (err, roles) {
          console.log('find role', err, roles)
          if (roles.length < 1) {
            console.log('no role ' + config.admin.role.admin);
            // create admin role
            let role = new Role({
              name: config.admin.role.admin,
              actions: [],
              status: 201 // admin role
            });
            role.save(function (err, result) {
              console.log('role result', result);
              obj.roles = [role._id];
              createUser(obj);
            });
            // create user role
            new Role({
              name: config.admin.role.user,
              actions: [],
              status: 202 // user role
            }).save();
          } else {
            obj.roles = [roles[0]._id];
            createUser(obj);
          }
        })
      }
    } else {
      let path = util.translateAdminDir('');
      res.redirect(path);
    }
  })
};
