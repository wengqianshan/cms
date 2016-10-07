var _ = require('underscore');
// 检查权限中间件
exports.checkAction = function(actionName) {
    //console.log(actionName)
    return function (req, res, next) {
        console.log(req.Actions)
        if (req.Roles.indexOf('admin') > -1) {
            return next();
        }
        var result = false;

        if (_.isArray(actionName)) {
            result = _.intersection(req.Actions, actionName).length === actionName.length;
        } else if(_.isString(actionName)) {
            result = req.Actions.indexOf(actionName) > -1;
        }

        if (result) {
            return next();
        } else {
            if (req.xhr) {
                res.json({
                    success: false,
                    msg: '无权访问'
                })
            } else {
                res.render('server/info', {
                    message: '无权访问'
                });
            }
        }
    };
}