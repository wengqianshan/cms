var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var moment = require('moment');
var underscore = require('underscore');

var util = require('./server/libs/util');
var appPath = process.cwd();
var config = require('./config');
//设置moment语言
moment.lang('zh-cn');


var app = express();

//连接数据库
mongoose.connect(config.mongodb.uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('连接mongodb成功');
});
//引入数据模型
util.walk(appPath + '/server/models', null, function(path) {
    require(path);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//定义全局字段
app.locals = {
    __title: 'CMS',
    pretty: true,
    moment: moment,
    _: underscore,
    util: util,
    __config: config,
    adminDir: config.admin.dir ? ('/' + config.admin.dir) : ''
};
app.set('config', config);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'ruoguan'/*,
    store: new RedisStore*/
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header('X-Powered-By', 'wengqianshan');
    if(req.session.user) {
        res.locals.User = req.session.user;
        //角色信息
        var roles = util.getRoles(req.session.user);
        var actions = util.getActions(req.session.user);
        req.Roles = roles;
        req.Actions = actions;
    }else{
        res.locals.User = null;
        req.Roles = null;
        req.Actions = null;
    }
    next();
});

//引入路由控制
util.walk(appPath + '/server/routes', 'middlewares', function(path) {
    require(path)(app);
});
util.walk(appPath + '/app/routes', 'middlewares', function(path) {
    require(path)(app);
});


var adminPath = util.translateAdminDir('');
app.use(adminPath, function(req, res, next) {
    var path = util.translateAdminDir('/index');
    return res.redirect(path);
    next();
})

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('app/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('app/error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('cms');
app.set('port', process.env.PORT || 7000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;
