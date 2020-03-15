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
      create: ["url", "md_url", "sm_url", "size", "type", "description"],
      update: ["url", "md_url", "sm_url", "size", "type", "description"]
    };
  }

  async upload(req, res) {
    let result = {};
    let error;
    const uid = req.user._id;
    if (!uid) {
      error = "缺少参数 uid";
      return res.json({
        success: !error,
        error: error
      });
    }
    try {
      result = await fileService.upload(req.files.files, {
        author: uid || ""
      });
    } catch (e) {
      error = "上传失败";
    }
    res.json({
      success: !error,
      data: result,
      error: error
    });
  }
  async delete(req, res) {
    let id = req.params.id;
    let data = null;
    let error;
    try {
      let isAdmin = req.isAdmin;
      let item = await this.service.findById(id);
      let isAuthor = !!(item.author && item.author + "" === req.user._id + "");
      if (!isAdmin && !isAuthor) {
        error = "没有权限";
      } else {
        data = await this.service.del(id);
      }
    } catch (e) {
      // error = e.message
      error = "系统异常";
    }
    res.json({
      success: !error,
      data: data,
      error: error
    });
  }
}

module.exports = new FileController()
