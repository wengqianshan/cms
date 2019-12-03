'use strict';

let express = require('express');
let mongoose = require('mongoose');
let gravatar = require('gravatar');
let path = require('path');
let favicon = require('serve-favicon');
let compression = require('compression')
let logger = require('morgan');
let session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(session); //存储session,防止服务重启后session丢失
let bodyParser = require('body-parser');
let csrf = require('csurf');
let moment = require('moment');
let _ = require('lodash');
let util = require('./lib/util');

let appPath = process.cwd();
let config = require('./config');
//设置moment语言
moment.locale('zh-cn');

let app = express();

app.use(compression())

//连接数据库
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri, { useNewUrlParser: true }).then(function (db) {
  console.log('mongodb连接成功')
}, function (err) {
  console.log('mongodb连接失败', err)
})
//载入数据模型
util.walk(appPath + '/models', null, function (path) {
  require(path);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
if (config.env === 'production') {
  app.enable('view cache');
}

//定义全局字段
app.locals = {
  title: config.title || 'CMS',
  pretty: true,
  moment: moment,
  _: _,
  util: util,
  config: config,
  adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
  gravatar: gravatar,
  env: config.env,
};
app.set('config', config);

app.use(favicon(__dirname + '/public/assets/app/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// session options https://www.npmjs.com/package/express-session
app.use(
  session({
    resave: true,
    cookie: {
      maxAge: 86400000 // 1 day
    },
    saveUninitialized: true,
    secret: config.sessionSecret || "cms",
    store: config.redis.host
      ? new RedisStore({ client: redis.createClient(config.redis) })
      : null
  })
);
util.walk(appPath + '/routes/api', 'middlewares', function (path) {
  require(path)(app);
});
app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.header('X-Powered-By', 'wengqianshan');
  res.locals.token = req.csrfToken && req.csrfToken();
  res.locals.query = req.query;
  if (req.session && req.session.user) {
    const roles = util.getRoles(req.session.user);
    const actions = util.getActions(req.session.user);
    req.user = req.session.user;
    req.isAdmin = req.session.user.status === 101;
    req.Roles = roles;
    req.Actions = actions;
    res.locals.Actions = actions;
    res.locals.User = req.session.user;
  } else {
    req.user = null;
    req.isAdmin = false;
    req.Roles = null;
    req.Actions = null;
    res.locals.Actions = null;
    res.locals.User = null;
  }
  next();
});

//路由控制
util.walk(appPath + '/routes/app', 'middlewares', function (path) {
  require(path)(app);
});
util.walk(appPath + '/routes/server', 'middlewares', function (path) {
  require(path)(app);
});


/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('页面不存在');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (config.env === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('server/error', {
      message: err.message,
      error: err
    });
  });
} else {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('app/error', {
      message: err.message
    });
  });
}

app.set('port', process.env.PORT || config.port || 7000);
let server = app.listen(app.get('port'), function () {
  console.log('网站服务已启动，端口号： ' + server.address().port);
});
