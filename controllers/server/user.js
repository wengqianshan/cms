'use strict';

let mongoose = require('mongoose')
let User = mongoose.model('User')
let Role = mongoose.model('Role')
let LogService = require('../../services/log');
let Log = new LogService();
let config = require('../../config')
let util = require('../../lib/util')
let crypto = require('../../lib/crypto')
let Mailer = require('../../lib/mailer')
let _ = require('lodash');
let mailer = new Mailer();
const notify = require('../../notify');

/*let userService = require('../../services/user')
userService.findById('53b6ca419dfe0cf41ccbaf96', ['roles', 'author']).then(function(res) {
    console.log(res)
}, function(err) {
    console.log(err)
})*/

// TODO: Run when the service is started 
exports.checkInstall = function (req, res, next) {
  if (req.session.user) {
    let path = util.translateAdminDir('/');
    return res.redirect(path);
  }
  User.find({}, function (err, results) {
    if (err) {
      return;
    }
    if (results.length > 0) {
      // let path = util.translateAdminDir('/user/login');
      // return res.redirect(path);
      return next();
    } else {
      //let path = util.translateAdminDir('/install');
      //return res.redirect(path);
      let path = util.translateAdminDir('/install')
      return res.render('server/install')
    }
  })
}

/*let user = new User({
    username: 'geo5',
    password: '123456',
    name: 'test5',
    email: 'geo_5@wenglou.com',
    position: [113.323571, 23.146439]
});
user.save(function(err, result) {
    console.log(result);
    
});*/
/*User.find({'position': {$near: [113.323571, 23.146439]}}).exec(function(err, res) {
    console.log(res);
})*/
/*User.find({'position': {
    $geoWithin: {
        $centerSphere: [
            [113.323571, 23.146439], .0000000000000005
        ]
    }
}}).exec(function(err, res) {
    console.log(res);
})*/

exports.authenticate = function (req, res, next) {
  if (!req.session.user) {
    let path = util.translateAdminDir('/user/login');
    return res.redirect(path);
  } else {
    next();
  }
};

exports.list = function (req, res) {
  let condition = {};
  const isAdmin = req.isAdmin;
  if (!isAdmin) {
    condition.author = req.session.user._id;
  }
  User.count(condition, function (err, total) {
    let query = User.find(condition).populate('author').populate('roles');
    let pageInfo = util.createPage(req.query.page, total);
    query.skip(pageInfo.start);
    query.limit(pageInfo.pageSize);
    query.sort({ created: -1 });
    query.exec(function (err, results) {
      //console.log(err, results);
      res.render('server/user/list', {
        title: 'User List',
        users: results,
        pageInfo: pageInfo,
        Menu: 'list'
      });
    });
  })
}

exports.one = function (req, res) {
  let id = req.params.id;
  User.findById(id).populate('author').populate('roles').exec(function (err, result) {
    res.render('server/user/item', {
      user: result
    });
  });
};

exports.query = function (req, res) {
  let kw = req.query.q;
  User.find({ name: new RegExp(kw, 'gi') }).exec(function (err, result) {
    console.log(err, result)
    let data = result.map(function (item) {
      return _.pick(item, '_id', 'name')
    })
    if (err) {
      return res.json({
        status: false,
        message: 'Failure'
      });
    }
    return res.json({
      status: true,
      items: data
    });
  });
};

exports.register = function (req, res) {
  let ip = util.getIp(req);
  let ua = req.get('User-Agent');

  let method = req.method;
  if (method === 'GET') {
    res.render('server/user/register', {});
  } else if (method === 'POST') {
    let obj = _.pick(req.body, 'username', 'password', 'email', 'mobile', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'position', 'questions');
    obj.reg_ip = ip;
    // console.log(obj);
    notify.sendMessage(`User Register: ${obj.username}`);
    let operator = function () {
      Role.findOne({ status: 202 }, function (err, role) {
        console.log('role', role);
        if (err || !role) {
          return res.render('server/info', {
            message: 'Failure, role not exist:' + config.admin.role.user
          });
        }
        obj.roles = [role._id];
        if (req.session.user) {
          obj.author = req.session.user._id;
        }
        // TODO：user activation

        let user = new User(obj);
        user.save(function (err, result) {
          console.log(result);
          Log.add({
            type: 'user',
            action: 'register',
            status: !err ? 'success' : 'failed',
            ip: ip,
            ua: ua,
            message: JSON.stringify(_.pick(obj, 'username', 'name', 'email', 'reg_ip')) + '\n' + err
          })
          if (err) {
            console.log(err);
            let errors = err.errors;
            let message = [];
            for (let i in errors) {
              message.push(errors[i].message);
            }
            return res.render('server/info', {
              message: 'Failure' + message.join('<br/>')
            });
          }
          res.render('server/info', {
            message: 'Success'
          });

        });
      });
    }

    if (config.stopForumSpam) {
      util.stopForumSpam({
        email: obj.email
      }).then((data) => {
        console.log(data, 'res')
        if (data && data.email && data.email.frequency > 5) {
          res.render("server/info", {
            message: "mail not allowed",
          });
          Log.add({
            type: 'user',
            action: 'register',
            status: 'spam',
            ip: ip,
            ua: ua,
            message: JSON.stringify(_.pick(obj, 'username', 'name', 'email', 'reg_ip')) + '\n stopforumspam'
          })
        } else {
          operator()
        }
      }, (err) => {
        //console.log(err, 'err')
        operator()
      })
    } else {
      operator()
    }

  }
};

exports.add = function (req, res) {
  let method = req.method;
  if (method === 'GET') {
    res.render('server/user/add', {
      Menu: 'add'
    });
  } else if (method === 'POST') {
    //let obj = req.body;
    let obj = _.pick(req.body, 'username', 'password', 'email', 'mobile', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'position', 'questions');
    console.log(obj);
    Role.findOne({ status: 202 }, function (err, role) {
      console.log('role', role);
      if (err || !role) {
        return res.render('server/info', {
          message: 'Failure, role not exist:' + config.admin.role.user
        });
      }
      obj.roles = [role._id];
      if (req.session.user) {
        obj.author = req.session.user._id;
      }
      let user = new User(obj);
      user.save(function (err, result) {
        console.log(result);
        if (req.xhr) {
          return res.json({
            status: !err
          })
        }
        if (err) {
          console.log(err);
          return res.render('server/info', {
            message: 'Failure'
          });
        }
        res.render('server/info', {
          message: 'Success'
        });
      });
    });
  }
};

exports.edit = function (req, res) {
  let id = req.params.id;
  let editHandler = function (user) {
    user.save(function (err, user) {
      if (req.xhr) {
        return res.json({
          status: !err
        })
      }
      if (err || !user) {
        console.log(err);
        return res.render('server/info', {
          message: 'Failure'
        });
      }
      if (id === req.session.user._id) {
        req.session.user = user;
        res.locals.User = user;
      }
      res.render('server/info', {
        message: 'Success'
      });
    })
  };
  if (req.method === 'GET') {
    User.findById(id).populate('author').exec(function (err, result) {
      if (err || !result) {
        return res.render('server/info', {
          message: 'System Error'
        });
      }
      let isAdmin = req.isAdmin;
      let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

      if (!isAdmin && !isAuthor) {
        return res.render('server/info', {
          message: 'no permission'
        });
      }
      try {
        let condition = {};
        const isAdmin = req.isAdmin;
        if (!isAdmin) {
          condition.author = req.session.user._id;
        }
        Role.find(condition, function (err, results) {
          if (!err && results) {
            res.render('server/user/edit', {
              user: result,
              roles: results
            });
          }
        })
      } catch (e) {
        res.render('server/user/edit', {
          user: result
        });
      }
    })
  } else if (req.method === 'POST') {
    //let obj = req.body;
    let obj = _.pick(req.body, 'username', 'email', 'mobile', 'name', 'avatar', 'gender', 'birthday', 'description', 'address', 'position', 'questions', 'roles');
    // check permission
    User.findById(id).populate('roles').populate('author').exec(function (err, user) {
      let isAdmin = req.isAdmin;
      let isAuthor = user.author && ((user.author._id + '') === req.session.user._id);
      let isMine = (user._id + '') === (req.user._id + '')
      // check roole
      const roles = req.Roles;
      const inputRoles = _.difference(obj.roles, roles);
      const overAuth = inputRoles.length > 0;

      if (!isAdmin && !isAuthor && !isMine) {
        return res.render('server/info', {
          message: 'No permission'
        });
      }
      if (!isAdmin && overAuth) {
        return res.render('server/info', {
          message: 'No permission'
        });
      }
      let query;
      if (typeof obj.roles === 'string') {
        query = Role.find({ _id: obj.roles });
      } else if (typeof obj.roles === 'object') {
        query = Role.find({ _id: { $in: obj.roles } })
      }
      if (!query) {
        return res.render('server/info', {
          message: 'no role info'
        });
      }
      query.exec(function (err, roles) {
        // admin user
        if (user.status === 101) {
          // TODO: validation
          let statuses = _.map(roles, 'status');
          if (statuses.indexOf(201) === -1) {
            return res.render('server/info', {
              message: 'admin user role incorrect'
            });
          }
        }
        obj.roles = roles;
        _.assign(user, obj);
        editHandler(user);
      });
    });
  }
};

exports.del = function (req, res) {
  let deleteHandle = function (user) {
    user.remove(function (err) {
      if (err) {
        return res.render('server/info', {
          message: 'Failure'
        });
      }
      res.render('server/info', {
        message: 'Success'
      })
    });
  };
  let id = req.params.id;
  User.findById(id).populate('roles').populate('author').exec(function (err, result) {
    if (!result) {
      return res.render("server/info", {
        message: "Not Exist",
      });
    }
    let isAdmin = req.isAdmin;
    let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

    if (!isAdmin && !isAuthor) {
      return res.render('server/info', {
        message: 'no permission'
      });
    }
    //System default users cannot delete
    if (result.status === 101) {
      return res.render("server/info", {
        message: "System default users cannot delete",
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
      // kill oneself
      if (id === req.session.user._id) {
        req.session.destroy();
        res.locals.User = null;
        console.log('Success');
        let path = util.translateAdminDir('');
        return res.redirect(path);
      }
      res.render('server/info', {
        message: 'Success'
      })
    });
  });
}


let noRedirect = [
  'user/login',
  'user/forget',
  'user/register'
]

exports.login = function (req, res) {
  let ip = util.getIp(req);
  let ua = req.get('User-Agent');

  if (req.method === 'GET') {
    req.session.loginReferer = req.headers.referer;
    res.render('server/user/login');
  } else if (req.method === 'POST') {
    let username = (req.body.username || '').trim();
    let password = req.body.password;
    if (!username) {
      return res.render("server/info", {
        message: "User name cannot be empty",
      });
    }
    notify.sendMessage(`User Login: ${username}`);
    User.findOne({
      username: username
    }).populate('roles').exec(function (err, user) {

      if (!user) {
        Log.add({
          type: "user",
          action: "login",
          status: "failed",
          ip: ip,
          ua: ua,
          message:
            JSON.stringify({
              username: username,
              ip: ip,
            }) +
            "\nNot Exist\n" +
            err,
        });
        return res.render("server/info", {
          message: "Wrong user name or password",
        });
      }
      if (user.authenticate(password)) {
        console.log('Success');
        // console.log(user);
        user.last_login_date = new Date();
        user.last_login_ip = ip;
        user.save();
        req.session.user = user;
        req.session.cookie.user = user;
        let path = util.translateAdminDir('/');

        let ref = req.session.loginReferer || path;
        for (let i = 0, len = noRedirect.length; i < len; i++) {
          if (ref.indexOf(noRedirect[i]) > -1) {
            ref = path;
            break;
          }
        }
        res.redirect(ref);
        Log.add({
          type: 'user',
          action: 'login',
          status: 'success',
          ip: ip,
          ua: ua,
          author: user,
          message: JSON.stringify({
            username: username,
            ip: ip
          }) + '\n' + err
        })
      } else {
        res.render("server/info", {
          message: "Wrong user name or password",
        });
        let hunter = (username === 'admin') ? (' \ntry password[' + password + ']') : ''
        Log.add({
          type: "user",
          action: "login",
          status: "failed",
          ip: ip,
          ua: ua,
          message:
            JSON.stringify({
              username: username,
              ip: ip,
            }) +
            "\npassword incorrect" +
            hunter +
            "\n" +
            err,
        });
      }
    });
  }

};

// reload session
exports.reload = function (uid, callback) {
  User.findById(uid).populate('roles').exec(function (err, user) {
    callback && callback.call(null, err, user);
  });
};

exports.logout = function (req, res) {
  if (req.session) {
    req.session.destroy();
    res.locals.User = null;
    console.log('Success');
    /*res.render('server/info', {
        message: 'Success'
    });*/
    let path = util.translateAdminDir('/');
    res.redirect(path);
  } else {
    res.render('server/info', {
      message: 'Failure'
    });
  }
};

exports.forget = function (req, res) {
  if (req.method === 'GET') {
    let hash = req.query.hash;
    if (!hash) {
      return res.render('server/user/forget');
    }
    User.findOne({ 'forget.hash': hash }, function (err, user) {
      console.log(err, user);
      if (err || !user) {
        return res.render('server/info', {
          message: 'invalid hash'
        });
      }
      let till = user.forget.till;
      // check hash expired
      if (!till || till.getTime() + config.findPasswordTill < Date.now()) {
        return res.render("server/info", {
          message: "Hash Expired",
        });
      } else {
        res.render('server/user/forget', {
          type: 'set',
          hash: hash,
          user: user
        });
      }
    });

  } else if (req.method === 'POST') {
    //console.log(req.query);
    if (req.query.hash) {
      let obj = req.body;
      let hash = req.query.hash;
      //update password
      User.findOne({ 'forget.hash': hash }, function (err, user) {
        //console.log(err, user);
        if (err || !user) {
          return res.render("server/info", {
            message: "token expired",
          });
        }
        let till = user.forget.till;
        //console.log(till.getTime(), Date.now());
        if (!till || till.getTime() + config.findPasswordTill < Date.now()) {
          return res.render("server/info", {
            message: "token expired",
          });
        } else {
          console.log('update');
          user.password = obj.password;
          user.forget.hash = '';
          user.forget.till = 0;
          user.save(function (err, result) {
            res.render('server/info', {
              message: 'Success'
            });
          });
        }
      });
      return;
    }
    let obj = req.body;
    let ip = util.getIp(req);
    let ua = req.get('User-Agent');
    Log.add({
      type: 'user',
      action: 'forget',
      status: 'start',
      ip: ip,
      ua: ua,
      message: obj.username
    })
    User.findOne({ username: obj.username }, function (err, user) {
      //console.log(user);
      if (err || !user) {
        return res.render('server/info', {
          message: 'error'
        });
      }
      let hash = crypto.random();
      user.forget = {
        hash: hash,
        till: new Date()
      };
      user.save(function (err, result) {
        //console.log(result);
        if (err || !result) {
          return res.render('server/info', {
            message: 'error '
          });
        }

        let url = req.headers.origin + req.originalUrl + '?hash=' + hash;

        mailer.send({
          from: config.mail.from,
          to: user.email,
          subject: 'Find Password',
          html: '<p>Hello, please click <a href="' + url + '">here</a>to reset your password<br/>' + url + '</p>',
        }).then((info) => {
          let message =
            "The reset password link has been sent to your mailbox:  " +
            user.email.replace(/^([\s\S])(.+)([\s\S])(@.+)/, "$1****$3$4");
          //console.log(err && err.stack);
          //console.dir(reply);
          res.render('server/info', {
            message: message
          });
        }).catch((err) => {
          res.render('server/info', {
            message: 'Failure'
          });
        })
      });

    });

  }
}

exports.changePassword = function (req, res) {
  let obj = req.body;
  User.findById(obj.id, function (err, user) {
    user.password = obj.password;
    user.save(function (err, result) {
      res.render('server/info', {
        message: 'Success'
      });
      console.log('Success', result);
    })
  });
};
