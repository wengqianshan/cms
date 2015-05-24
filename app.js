var express = require('express');
var mongoose = require('mongoose');
var gravatar = require('gravatar');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);//存储session,防止服务重启后session丢失
var bodyParser = require('body-parser');
var csrf = require('csurf');
var moment = require('moment');
var underscore = require('underscore');
var multipart = require('connect-multiparty');//解析文件
var core = require('./libs/core');
var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});
var strip = require('strip');

var appPath = process.cwd();
var config = require('./config');
//设置moment语言
moment.locale('zh-cn');


var app = express();

//连接数据库
mongoose.connect(config.mongodb.uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('mongodb连接成功');
});
//引入数据模型
core.walk(appPath + '/models', null, function(path) {
    require(path);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//定义全局字段
app.locals = {
    title: 'CMS',
    pretty: true,
    moment: moment,
    _: underscore,
    core: core,
    config: config,
    adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
    gravatar: gravatar,
    md: marked,
    strip: strip
};
app.set('config', config);
app.set('env', config.env || 'development');

app.use(favicon(__dirname + '/public/assets/app/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'ruoguan'/*,
    store: new RedisStore*/
}));
app.use(multipart({
    uploadDir: config.upload.tmpDir
}));
app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header('X-Powered-By', 'wengqianshan');
    res.locals.token = req.csrfToken();
    if(req.session.user) {
        res.locals.User = req.session.user;
        //角色信息
        var roles = core.getRoles(req.session.user);
        var actions = core.getActions(req.session.user);
        req.Roles = roles;
        req.Actions = actions;
        res.locals.Roles = roles;
        res.locals.Actions = actions;
    }else{
        res.locals.User = null;
        req.Roles = null;
        req.Actions = null;
        res.locals.Roles = null;
        res.locals.Actions = null;
    }
    next();
});

//引入路由控制
/*core.walk(appPath + '/server/routes', 'middlewares', function(path) {
    require(path)(app);
});
core.walk(appPath + '/app/routes', 'middlewares', function(path) {
    require(path)(app);
});*/

core.walk(appPath + '/routes', 'middlewares', function(path) {
    require(path)(app);
});

//for pi
var piSwitch = 'false';
var piOpenTime = null;
var piCloseTime = null;
app.use('/pi/switch/1', function(req, res, next) {
    piSwitch = 'true';
    piOpenTime = Date.now();
    res.json({
        success: true,
        value: piSwitch
    });
});
app.use('/pi/switch/0', function(req, res, next) {
    piSwitch = 'false';
    piCloseTime = Date.now();
    res.json({
        success: true,
        value: piSwitch
    });
});

app.use('/pi/switch', function(req, res, next) {
    res.json({
        value: piSwitch,
        openTime: piOpenTime,
        closeTime: piCloseTime
    });
});
app.use('/pi', function(req, res, next) {
    res.render('app/pi');
});


//后台管理路由
var adminPath = core.translateAdminDir('');
app.use(adminPath, function(req, res, next) {
    var path = core.translateAdminDir('/index');
    return res.redirect(path);
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('找不到页面了');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('server/error', {
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
        message: err.message
    });
});

var debug = require('debug')('cms');
app.set('port', process.env.PORT || config.port || 7000);
var server = app.listen(app.get('port'), function() {
  console.log('网站服务已启动，端口号： ' + server.address().port);
});


module.exports = app;
