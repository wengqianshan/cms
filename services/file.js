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
    console.log('调试开始')
    return new Promise((resolve, reject) => {
      uploader.post(files, (result) => {
        console.log('上传结果', result);

        if (!result || !result.files) {
          return reject({
            code: -1,
            message: '未知错误'
          });
        }
        let len = result.files.length;
        let json = {
          files: []
        };
        result.files.forEach((item) => {
          Object.keys(fields).forEach((key) => {
            item[key] = fields[key]
          })
          //这里还可以处理url
          let fileObj = item; //_.pick(item, 'name', 'size', 'type', 'url');
          // console.log('fileObj: ', fileObj);
          let file = new this.Model(fileObj);
          file.save((err, obj) => {
            if (err || !obj) {
              console.log('保存file失败', err, obj);
              // return;
            }
            // TODO: 改成异步
            len--;
            item._id = obj._id;
            json.files.push(item);
            if (len === 0) {
              // console.log(json)
              resolve(json);
            }
          });
        });
      });
    });
  }

  del(id) {
    return new Promise(async (resolve, reject) => {
      const file = await this.Model.findById(id);
      try {
        // 删除主文件
        uploader.delete(file.url, err => {
          if (err) {
            console.log(err)
          }
        });
        // 删除封面
        if (file.covers && file.covers.length > 0) {
          file.covers.forEach((cover) => {
            uploader.delete(cover, err => {
              console.log('删除封面: ', err);
            })
          })
        }
        // 删除数据库记录
        file.remove((err, product) => {
          console.log('文件数据库删除结果: ', err);
          if (err) {
            reject(err)
          } else {
            resolve(product)
          }
        });
      } catch (e) {
        console.log(e);
        reject(e.message);
      }
    })
  }
}

module.exports = Service;

