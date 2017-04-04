let express = require('express')
let router = express.Router()
let file = require('../../../controllers/api/v1/file')

//
router.use(function(req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    next();
});
router.route('/files').all(file.list);
router.route('/files/:id').all(file.item);

module.exports = function(app) {
    app.use('/api/v1', router);
};
