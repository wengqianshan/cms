/**
 * file
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
    notify.sendMessage('Upload File');
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
        // console.log('upload result: ', result);
        resolve({
          files: result
        });
      } catch(e) {
        reject(e);
      }
    });
  }
  // delete file, include covers
  del(id) {
    return new Promise(async (resolve, reject) => {
      const file = await this.Model.findById(id);
      try {
        // rm file
        await uploader.delete(file);
        // rm data
        file.remove((err, product) => {
          // console.log('result: ', err);
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

