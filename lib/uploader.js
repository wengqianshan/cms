'use strict';

//上传文件
//用法
// let upload = require('./upload')({
//     maxFileSize: 30000
// });
// upload.post(req, res, callback);
//todo: use multer https://cnodejs.org/topic/564f32631986c7df7e92b0db

const path = require('path');
const fs = require('fs');
const qn = require('qn');
const videoExtracter = require('video-extracter');
const mkdirp = require('mkdirp');
const del = require('del');

const config = require('../config');

const existsSync = fs.existsSync || path.existsSync
const nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/

class Uploader {
  constructor(opts) {
    this.options = Object.assign(config.upload, opts);
    this.checkExists(this.options.tmpDir);
    this.checkExists(this.options.uploadDir);
    this.client = qn.create(this.options.storage.options);
  }

  checkExists(dir) {
    fs.exists(dir, function (exists) {
      if (!exists) {
        mkdirp(dir, function (err) {
          if (err) console.error(err)
          else console.log("默认目录不存在，已自动创建： [" + dir + "]");
        });
      }
    });
  }

  nameCountFunc(s, index, ext) {
    return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
  }

  safeName(_name) {
    let name = path.basename(_name).replace(/^\.+/, '');
    while (existsSync(path.join(this.options.uploadDir, name))) {
      name = name.replace(nameCountRegexp, this.nameCountFunc);
    }
    return name;
  }

  validate(file) {
    let error = '';
    if (this.options.minFileSize && this.options.minFileSize > file.size) {
      error = 'File is too small';
    } else if (this.options.maxFileSize && this.options.maxFileSize < file.size) {
      error = 'File is too big';
    } else if (!this.options.acceptFileTypes.test(file.name)) {
      error = 'Filetype not allowed';
    }
    return !error;
  }

  delete(url, callback) {
    if (!url || typeof url !== 'string') {
      // console.log('url不是字符串: ', url);
      return callback && callback.call(null, 'url不是字符串');
    }

    let fileName = path.basename(decodeURIComponent(url))
    // console.log('删除文件', url, fileName);

    if (fileName[0] !== '.') {
      if (url.indexOf(this.options.storage.options.domain) > -1) {
        // 删除七牛图片
        try {
          this.client.delete(fileName, function (err) {
            callback && callback.call(null, err);
          })
        } catch (e) {
          // console.log('删除7牛图片失败', e);
          callback && callback.call(null, '删除7牛图片失败');
        }
      } else {
        // 删除本地图片
        let localPath = path.join(this.options.uploadDir, fileName);
        //如果是封面图片
        let coverPath = path.join(this.options.uploadUrl, 'covers');
        if (url.indexOf(coverPath) > -1) {
          localPath = url.replace(this.options.uploadUrl, this.options.uploadDir);
        }
        del(localPath, function (err) {
          // console.log('删除本地文件结果: ', err)
          callback && callback.call(null, err);
        });
      }
    } else {
      callback && callback.call(null, '文件类型错误');
    }
  }

  // 七牛同步上传
  uploadSync(file) {
    return new Promise((resolve, reject) => {
      try {
        this.client.uploadFile(file.path, (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res); // {url: 'xx'}
        });
      } catch (e) {
        reject(e.message);
      }
    });
  }

  // 转移图片，上传到七牛或者本地
  move(file) {
    return new Promise(async (resolve, reject) => {
      let coverData = {};
      if (file.type.indexOf('video') > -1) {
        coverData = await videoExtracter(file.path, {
          settings: {
            number: 3
          },
          dirname: path.join(this.options.uploadDir, 'covers')
        });
        console.log('covers: ', coverData);
      }
      if (this.options.storage.type === 'qiniu') {
        console.log('开始七牛上传 ----- ');
        const res = await this.uploadSync(file);
        // console.log('qiniu res', res);
        const coverFiles = [];
        if (coverData && coverData.files && coverData.files.length > 0) {
          for (let i in coverData.files) {
            const f = await this.uploadSync({
              path: coverData.files[i]
            });
            coverFiles.push(f.url);
          }
          console.log('七牛已上传的封面: ', coverFiles)
          // 已经上传到七牛的封面，删除本地目录
          del(coverData.dirname).then(res => {
            // console.log('del: ', res);
          }).catch(e => {
            // console.log('del error: ', e);
          })
        }
        resolve({
          url: res.url,
          md_url: res.url + '?imageView/1/w/300',
          sm_url: res.url + '?imageView/1/w/100',
          name: file.name,
          size: file.size,
          type: file.type,
          covers: coverFiles
        });
        // 删除已上传到七牛的本地文件缓存
        del(file.path).then((res) => {
          // console.log(res);
        }).catch(e => {
          // console.log(e);
        })
      } else {
        console.log('开始本地上传 ----- ');
        const safeName = this.safeName(file.name);
        const filePath = path.join(this.options.uploadDir, safeName);
        let coverFiles = [];
        if (coverData.files) {
          coverFiles = coverData.files.map(p => {
            return path.join(this.options.uploadUrl, p.split(this.options.uploadUrl)[1]);
          });
        }
        try {
          fs.renameSync(file.path, filePath);
          resolve({
            url: path.join(this.options.uploadUrl, encodeURIComponent(safeName)),
            name: safeName,
            size: file.size,
            type: file.type,
            covers: coverFiles
          });
        } catch (e) {
          reject(e.message);
        }
      }
    });
  }

  post(files, callback) {
    if (!files || files.length < 1) {
      return callback();
    }
    const fns = [];
    files.forEach((file) => {
      // 删除不合格的图片
      if (!this.validate(file)) {
        del(file.path).then((res) => {
          // console.log(res);
        }).catch(e => {
          // console.log(e);
        })
        return;
      }
      fns.push(this.move(file));
    });
    Promise.all(fns).then((res) => {
      // console.log('promise: ', res);
      callback({
        files: res
      });
    }).catch(e => {
      // console.log(e)
      callback({
        files: []
      });
    });
  }


}

module.exports = Uploader;
