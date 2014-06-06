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
moment.lang('zh-cn');
var util = require('./server/libs/util');
var appPath = process.cwd();

var app = express();

//连接数据库
mongoose.connect('mongodb://localhost/cms');
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

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'ruoguan'/*,
    store: new RedisStore*/
}));
app.use(function(req, res, next) {
    /*res.locals.user = {
        name: 'xiaoshan',
        username: 'aaaa'
    };*/
    //req.session.user = '1111'
    if(req.session) {
        //req.session.destroy();
        //req.session.user = null;
        //delete req.session.user;
    }
    if(req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
//定义全局字段
app.locals = {
    title: '弱冠',
    pretty: true,
    moment: moment
}

//引入路由控制
util.walk(appPath + '/server/routes', 'middlewares', function(path) {
    require(path)(app);
});

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('cms');
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;
