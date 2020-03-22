'use strict';

const Base = require('./base')
let ContentService = require('../../../services/content')
let contentService = new ContentService();

class ContentController extends Base{
  constructor(props) {
    super(props);
    this.service = contentService;
    this.populates = {
      list: [{
        path: 'author',
        select: 'name avatar'
      }, {
        path: 'gallery',
        match: { type: /(image)|(video)/ },
        select: 'name url md_url sm_url type covers width height',
        options: {
          limit: 3
        }
      }],
      item: [{
        path: 'author',
        select: 'name avatar'
      }, {
        path: 'gallery',
        match: { type: /(image)|(video)/ },
        select: 'name url md_url sm_url type covers width height'
      }]
    };
    this.fields = {
      list: ['_id', 'title', 'category', 'author', 'up', 'like', 'status', 'visits', 'created', 'tags', 'gallery', 'comments'],
      create: ['title', 'summary', 'content', 'gallery', 'category', 'tags'],
      update: ['title', 'summary', 'content', 'gallery', 'category', 'tags']
    };
  }
}

module.exports = new ContentController()
