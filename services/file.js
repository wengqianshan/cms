/**
 * 文件服务
 **/
'use strict';

let fs = require('fs');
let mongoose = require('mongoose');
let _ = require('lodash');
let File = mongoose.model('File');

const Uploader = require('../libs/uploader');
const uploader = new Uploader();

let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = File;
  }

  findBySome(id, populates) {
    return new Promise((resolve, reject) => {
      let query = this.Model.findById(id)
      if (populates && populates.length > 0) {
        populates.forEach(function (item) {
          query = query.populate(item);
        })
      }
      query.exec(function (err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    })
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
}

module.exports = Service;

