'use strict';

const Base = require('./base')
let CategoryService = require('../../../services/category')
let categoryService = new CategoryService();

class CategoryController extends Base{
  constructor(props) {
    super(props);
    this.service = categoryService;
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
      list: ["_id", "name", "flag", "author", "description", "parent"],
      create: ["name", "flag", "author", "description", "parent"],
      update: ["name", "flag", "description", "parent"]
    };
  }
}

module.exports = new CategoryController();
