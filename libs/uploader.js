//上传文件
//用法
// var upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
module.exports = function (options) {
    var path = require('path'),
        fs = require('fs'),
        _existsSync = fs.existsSync || path.existsSync,
        mkdirp = require('mkdirp'),
        nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
        tmpDir = options.tmpDir || '',
        uploadDir = options.uploadDir || '',
        uploadUrl = options.uploadUrl || '',
        useSSL = options.useSSL || false,
        minFileSize = options.minFileSize || 10000000,
        maxFileSize = options.maxFileSize || 100000000,
        acceptFileTypes = options.acceptFileTypes || /.+/i;
    // check if upload folders exists
    function checkExists(dir){
        fs.exists(dir, function(exists){
            if(!exists)
            {
                mkdirp(dir, function (err) {
                    if (err) console.error(err)
                    else console.log("The uploads folder was not present, we have created it for you ["+dir+"]");
                });
                 //throw new Error(dir + ' does not exists. Please create the folder');
            }
        });
    }
    checkExists(options.tmpDir);
    checkExists(options.uploadDir);
    var nameCountFunc = function (s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    };
    var safeName = function (name) {
        // Prevent directory traversal and creating hidden system files:
        var name = path.basename(name).replace(/^\.+/, '');
        // Prevent overwriting existing files:
        if(_existsSync(options.uploadDir + '/' + name)) {
            name = name.replace(nameCountRegexp, nameCountFunc);
        }
        return name;
    };

    var initUrls = function (req, file) {
            var baseUrl = (options.useSSL ? 'https:' : 'http:') +
                '//' + req.headers.host + options.uploadUrl;
            var url =  baseUrl + encodeURIComponent(file.name);
            
    };
    var validate = function (file) {
        var error = '';
        if (options.minFileSize && options.minFileSize > file.size) {
            error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < file.size) {
            error = 'File is too big';
        } else if (!options.acceptFileTypes.test(file.name)) {
            error = 'Filetype not allowed';
        }
        return !error;
    };
    var setNoCacheHeaders = function (res) {
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Content-Disposition', 'inline; filename="files.json"');
    };
    var Uploader = {};
    Uploader.post = function(req, res, callback) {
        var files = req.files.files;
        if(files.length < 1) {
            return;
        }
        var result = [];
        files.forEach(function(file) {
            if (!validate(file)) {
                fs.unlink(file.path);
                return;
            }
            fs.renameSync(file.path, options.uploadDir + '/' + safeName(file.name));
            result.push({
                url: initUrls(req, file),
                name: file.name,
                size: file.size,
                type: file.type
            })
        });
        return result;
    }
};



