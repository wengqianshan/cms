'use strict';

const Base = require('./base')
let TagService = require('../../../services/tag')
let tagService = new TagService();

class CategoryController extends Base{
  constructor(props) {
    super(props);
    this.service = tagService;
    this.populates = {
      list: [{
        path: 'author',
        select: 'name avatar'
      }],
      item: [{
        path: 'author',
        select: 'name avatar'
      }]
    };
    this.fields = {
      list: ["_id", "name", "description", "author"],
      create: ["name", "description", "author"],
      update: ["name", "description"]
    };
  }
}

module.exports = new CategoryController();
