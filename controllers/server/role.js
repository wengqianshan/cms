'use strict';

let mongoose = require('mongoose')
let Role = mongoose.model('Role')
let userController = require('./user')
let _ = require('lodash')
let util = require('../../lib/util')
const ACTIONS = require('../../actions')

exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  Role.count(condition, function (err, total) {
    let query = Role.find(condition).populate('author');
    let pageInfo = util.createPage(req.query.page, total);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(results)
      res.render('server/role/list', {
        roles: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    });
  })
};

exports.one = function (req, res) {
  let id = req.params.id;
  Role.findById(id).populate('author').exec(function (err, result) {
    console.log(result);
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    res.render('server/role/item', {
      title: result.name,
      role: result
    });
  });
};

exports.add = function (req, res) {
  if (req.method === 'GET') {
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
    res.render('server/role/add', {
      Menu: 'add',
      ACTIONS: actions
    });
  } else if (req.method === 'POST') {
    let obj = _.pick(req.body, 'name', 'actions', 'description');
    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    // check actions
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      let overAuth = _.difference(obj.actions, req.Actions);
      if (overAuth.length > 0) {
        return res.render('server/info', {
          message: 'You have no permissions:' + overAuth.join(',')
        });
      }
    }
    if (req.session.user) {
      obj.author = req.session.user._id;
    }
    let role = new Role(obj);
    role.save(function (err, role) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
      }
      if (err) {
        return res.render('server/info', {
          message: 'Failure'
        });
      }
      res.render('server/info', {
        message: 'Success'
      });
    });
  }
};
exports.edit = function (req, res) {
  if (req.method === 'GET') {
    let id = req.params.id;
    Role.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      if (result.status === 201) {
        return res.render("server/info", {
          message: "The system default administrator role cannot be modified",
        });
      }
      //console.log(result)
      let actions = [];
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
      res.render('server/role/edit', {
        data: result,
        ACTIONS: actions
      });
    });
  } else if (req.method === 'POST') {
    let id = req.params.id;
    let obj = _.pick(req.body, 'name', 'actions', 'description');
    let actions = obj.actions;
    obj.actions = _.uniq(actions);
    Role.findById(id).populate('author').exec(function (err, result) {
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      if (result.status === 201) {
        return res.render("server/info", {
          message: "The system default administrator role cannot be modified",
        });
      }
      // check actions
      if (!isAdmin) {
        let overAuth = _.difference(obj.actions, req.Actions);
        if (overAuth.length > 0) {
          return res.render('server/info', {
            message: 'You have no permissions:' + overAuth.join(',')
          });
        }
      }
      _.assign(result, obj);
      result.save(function (err, role) {
        if (req.xhr) {
          return res.json({
            status: !err
          })
        }
        if (err || !role) {
          return res.render('server/info', {
            message: 'Failure'
          });
        }
        // reset session
        userController.reload(req.session.user._id, function (err, user) {
          req.session.user = user;
          res.locals.User = user;
          if (!err) {
            res.render('server/info', {
              message: 'Success'
            });
          }
        });
      });
    });
  }
};

exports.del = function (req, res) {
  let id = req.params.id;
  Role.findById(id).populate('author').exec(function (err, result) {
    if (!result) {
      return res.render('server/info', {
        message: 'Not Exist'
      });
    }
    let isAdmin = req.isAdmin;
    let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

    if (!isAdmin && !isAuthor) {
      return res.render('server/info', {
        message: 'no permission'
      });
    }
    if (result.status === 201 || result.status === 202) {
      return res.render("server/info", {
        message: "The system default role cannot be deleted",
      });
    }
    result.remove(function (err) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
      }
      if (err) {
        return res.render('server/info', {
          message: 'Failure'
        });
      }
      /*res.render('server/info', {
          message: 'Success'
      })*/
      // reset session
      userController.reload(req.session.user._id, function (err, user) {
        req.session.user = user;
        res.locals.User = user;
        if (!err) {
          res.render('server/info', {
            message: 'Success'
          });
        }
      });
    });
  });
};
