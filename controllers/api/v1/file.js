'use strict';

let FileService = require('../../../services/file')
let fileService = new FileService()
const Base = require('./base')

class FileController extends Base {
  constructor(props) {
    super(props);
    this.service = fileService;
    this.populates = {
      list: [],
      item: []
    };
    this.fields = {
      list: [],
      create: ['url', 'md_url', 'sm_url', 'size', 'type', 'description'],
      update: ['url', 'md_url', 'sm_url', 'size', 'type', 'description']
    };
  }

  async upload(req, res) {
    let result = null;
    let error;
    const uid = req.body.uid;
    if (!uid) {
      error = '缺少参数 uid';
      return res.json({
        success: !error,
        error: error
      });
    }
    try {
      result = await fileService.upload(req.files.files, {
        author: req.body.uid || ''
      });
    } catch (e) {
      error = '上传失败'
    }
    res.json({
      success: !error,
      data: result,
      error: error
    });
  }
}

module.exports = new FileController()
