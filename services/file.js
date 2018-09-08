/**
 * 文件服务
 **/
'use strict';

const path = require('path');
let mongoose = require('mongoose');
let File = mongoose.model('File');
const notify = require('../notify');

const Uploader = require('../lib/uploader');
const uploader = new Uploader();

let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = File;
  }

  upload(files, fields = {}) {
    notify.sendMessage('用户上传图片');
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
  // 根据 id 删除文件(含封面)
  del(id) {
    return new Promise(async (resolve, reject) => {
      const file = await this.Model.findById(id);
      try {
        // 删除文件
        await uploader.delete(file);
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

