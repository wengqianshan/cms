'use strict';

const Base = require('./base')
let ContentService = require('../../../services/content')
let contentService = new ContentService();

class ContentController extends Base {
  constructor(props) {
    super(props);
    this.service = contentService;
    this.populates = {
      list: [
        {
          path: "author",
          select: "name avatar",
        },
        {
          path: "gallery",
          match: { type: /(image)|(video)/ },
          select: "name url md_url sm_url type covers width height",
          perDocumentLimit: 3,
        },
      ],
      item: [
        {
          path: "author",
          select: "name avatar",
        },
        {
          path: "gallery",
          match: { type: /(image)|(video)/ },
          select: "name url md_url sm_url type covers width height",
        },
      ],
    };
    this.fields = {
      list: [
        "_id",
        "title",
        "summary",
        "category",
        "author",
        "up",
        "like",
        "status",
        "visits",
        "created",
        "tags",
        "gallery",
        "comments",
      ],
      create: [
        "title",
        "summary",
        "content",
        "gallery",
        "category",
        "tags",
        "up",
      ],
      update: [
        "title",
        "summary",
        "content",
        "gallery",
        "category",
        "tags",
        "up",
        "like",
      ],
    };
  }

  up = async (req, res) => {
    let id = req.params.id;
    let data = null;
    let error;
    try {
      let isAdmin = req.isAdmin;
      let item = await this.service.findById(id);
      if (!isAdmin) {
        error = "no permission";
      } else {
        item.up = +!item.up;
        data = await item.save();
      }
    } catch (e) {
      console.log(e);
      // error = e.message
      error = "system error";
    }
    res.json({
      success: !error,
      data: data,
      error: error,
    });
  }
}

module.exports = new ContentController()
