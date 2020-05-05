'use strict';

// file upload
//todo: use multer https://cnodejs.org/topic/564f32631986c7df7e92b0db

const path = require('path');
const fs = require('fs');
const qn = require('qn');
const videoExtracter = require('video-extracter');
const mkdirp = require('mkdirp');
const del = require('del');
const md5File = require('md5-file');
const objectid = require('bson-objectid');
const pixels = require("image-pixels");

const config = require('../config');

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
          else console.log("mkdir： [" + dir + "]");
        });
      }
    });
  }

  nameCountFunc(s, index, ext) {
    return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
  }

  safeName(name) {
    const oid = objectid().toString();
    const ext = path.extname(name);
    return `${oid}${ext}`;
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
    error && console.log(error);
    return !error;
  }

  /**
   * delete
   * @param {string} url
   * @return {string|array}
   */
  delete(file) {
    const {url, covers} = file;
    const hasCover = covers && covers.length > 0;
    return new Promise(async (resolve, reject) => {
      if (!url || typeof url !== 'string') {
        return reject(new Error('url must be string'));
      }
      let fileName = path.basename(url);
      if (fileName[0] === '.') {
        return reject(new Error('file type error'));
      }
      if (url.indexOf(this.options.storage.options.origin) > -1) {
        // delete qiniu file
        try {
          if (hasCover) {
            covers.forEach(async (item) => {
              const hash = path.basename(item);
              await this.delSync(hash);
            });
          }
          const data = await this.delSync(fileName);
          resolve(data);
        } catch (e) {
          reject(new Error('qiniu error'));
        }
      } else {
        // delete local file
        let localPath = path.join(this.options.uploadDir, fileName);
        try {
          //try delete cover dir
          if (hasCover) {
            const coverPath = path.join(this.options.uploadDir, 'covers', fileName);
            del.sync(coverPath);
          }
          const list = del.sync(localPath);
          resolve(list);
        } catch(e) {
          reject(e);
        }
      }
    });
  }

  // qiniu delete sync
  delSync(filename) {
    return new Promise((resolve, reject) => {
      try {
        this.client.delete(filename, (err, res) => {
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
  // qiniu upload sync
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

  // mv file
  move(file) {
    return new Promise(async (resolve, reject) => {
      let coverData = {};
      const safeName = this.safeName(file.name);
      const md5 = md5File.sync(file.path);
      // TODO: validate file exist
      // image width height
      let width;
      let height;
      if (file.type.indexOf('image') > -1) {
        try{
          const pix = await pixels(file.path);
          width = pix.width;
          height = pix.height;
        } catch(e) {
          console.log('get file pixel failed', e);
        }
      }
      if (file.type.indexOf('video') > -1) {
        coverData = await videoExtracter(file.path, {
          settings: {
            number: 3,
            // keep_pixel_aspect_ratio: false,
            // keep_aspect_ratio: false,
          },
          dirname: path.join(this.options.uploadDir, 'covers'),
          subdir: safeName,
        });
        const { w, h } = coverData.resolution || {};
        width = w;
        height = h;
        // console.log('covers: ', coverData);
        if (coverData.error) {
          console.warn('video extracter error: ', coverData.error);
        }
      }
      if (this.options.storage.type === 'qiniu') {
        console.log('qiniu start ----- ');
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
          // console.log('qiniu covers: ', coverFiles)
          // remove local dir
          del(coverData.dirname).then(res => {
            // console.log('del: ', res);
          }).catch(e => {
            // console.log('del error: ', e);
          })
        }
        resolve({
          url: res.url,
          md_url: res.url + "?imageView/1/w/300",
          sm_url: res.url + "?imageView/1/w/100",
          name: file.name,
          size: file.size,
          type: file.type,
          covers: coverFiles,
          md5,
          width,
          height
        });
        // remove local file
        del(file.path).then((res) => {
          // console.log(res);
        }).catch(e => {
          // console.log(e);
        })
      } else {
        console.log('upload start ----- ');
        const filePath = path.join(this.options.uploadDir, safeName);
        let coverFiles = [];
        if (coverData.files) {
          coverFiles = coverData.files.map(p => {
            return path.join(this.options.uploadUrl, p.split(this.options.uploadDir)[1]);
          });
        }
        try {
          fs.renameSync(file.path, filePath);
          resolve({
            url: path.join(this.options.uploadUrl, safeName),
            name: file.name,
            size: file.size,
            type: file.type,
            covers: coverFiles,
            md5,
            width,
            height
          });
        } catch (e) {
          reject(e.message);
        }
      }
    });
  }

  /**
   * post
   * @param {array} files
   * @param {object}
   * {files: [object]}
   */
  post(files) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!files || files.length < 1) {
          return reject(new Error('no file'));
        }
        const result = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!this.validate(file)) {
            del.sync(file.path);
          } else {
            const item = await this.move(file);
            result.push(item);
          }
        }
        resolve({
          files: result
        });
      } catch(e) {
        reject(e);
      }
    });
  }


}

module.exports = Uploader;
