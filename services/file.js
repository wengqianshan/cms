/**
 * 文件服务
 **/
'use strict';

let fs = require('fs');
let mongoose = require('mongoose');
let _ = require('lodash');
let File = mongoose.model('File');

const Uploader = require('../lib/uploader');
const uploader = new Uploader();

let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = File;
  }

  upload(files, fields = {}) {
    // console.log('调试开始')
    return new Promise(async (resolve, reject) => {
      try {
        const data = await uploader.post(files);
        const result = [];
        for (let i = 0; i < data.files.length; i ++) {
          let item = data.files[i];
          const fileObj = Object.assign(item, fields);
          const file = await this.Model.create(fileObj);
          result.push(file);
        }
        // console.log('上传结果: ', result);
        resolve({
          files: result
        });
      } catch(e) {
        reject(e);
      }
    });
  }

  del(id) {
    return new Promise(async (resolve, reject) => {
      const file = await this.Model.findById(id);
      try {
        // 删除主文件
        await uploader.delete(file.url);
        // 删除封面
        if (file.covers && file.covers.length > 0) {
          file.covers.forEach(async (cover) => {
            await uploader.delete(cover);
          });
        }
        // 删除数据库记录
        file.remove((err, product) => {
          // console.log('文件数据库删除结果: ', err);
          if (err) {
            reject(err)
          } else {
            resolve(product)
          }
        });
      } catch (e) {
        // console.log(e);
        reject(e);
      }
    })
  }
}

module.exports = Service;

