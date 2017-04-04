'use strict';

let express = require('express');
let mongoose = require('mongoose');
let gravatar = require('gravatar');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let RedisStore = require('connect-redis')(session); //存储session,防止服务重启后session丢失
let bodyParser = require('body-parser');
let csrf = require('csurf');
let moment = require('moment');
let underscore = require('underscore');
let multipart = require('connect-multiparty'); //解析文件
let core = require('./libs/core');
let marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    //sanitize: true,// 不解析html标签
    smartLists: true,
    smartypants: false
});
let strip = require('strip');

let appPath = process.cwd();
let config = require('./config');
//设置moment语言
moment.locale('zh-cn');

let app = express();

//连接数据库
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('mongodb连接成功');
});
//载入数据模型
core.walk(appPath + '/models', null, function(path) {
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
    title: 'CMS',
    pretty: true,
    moment: moment,
    _: underscore,
    core: core,
    config: config,
    adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
    gravatar: gravatar,
    md: marked,
    strip: strip,
    env: config.env
};
app.set('config', config);

app.use(favicon(__dirname + '/public/assets/app/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'ruoguan',
    store: (config.redis ? new RedisStore(config.redis) : null)
}));
//上传中间件，todo：换成multer, no global middleware
app.use(multipart({
    uploadDir: config.upload.tmpDir
}));
app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header('X-Powered-By', 'wengqianshan');
    res.locals.token = req.csrfToken && req.csrfToken();
    if (req.session.user) {
        res.locals.User = req.session.user;
        //角色信息
        let roles = core.getRoles(req.session.user);
        let actions = core.getActions(req.session.user);
        req.Roles = roles;
        req.Actions = actions;
        res.locals.Roles = roles;
        res.locals.Actions = actions;
    } else {
        res.locals.User = null;
        req.Roles = null;
        req.Actions = null;
        res.locals.Roles = null;
        res.locals.Actions = null;
    }
    next();
});

//路由控制
core.walk(appPath + '/routes', 'middlewares', function(path) {
    require(path)(app);
});

//后台管理路由
/*let adminPath = core.translateAdminDir('');
app.use(adminPath, function(req, res, next) {
    let path = core.translateAdminDir('/index');
    return res.redirect(path);
});*/

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('页面不存在');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (config.env === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('server/error', {
            message: err.message,
            error: err
        });
    });
} else {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('app/error', {
            message: err.message
        });
    });    
}

let debug = require('debug')('cms');
app.set('port', process.env.PORT || config.port || 7000);
let server = app.listen(app.get('port'), function() {
    console.log('网站服务已启动，端口号： ' + server.address().port);
});