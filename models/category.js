'use strict';

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let CategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    unique: true
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  description: String,
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Number,
    default: 0
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Category'
  }
});
CategorySchema.methods = {

};

mongoose.model('Category', CategorySchema);

/*
 * Nested example
 * 
let items = [
    {
        id: 1,
        name: 'category1'
    },{
        id: 2,
        name: 'category1'
    },{
        id: 3,
        name: 'category1',
        parent: 1
    },{
        id: 4,
        name: 'category1',
        parent: 2
    },{
        id: 5,
        name: 'category1',
        parent: 3
    },{
        id: 6,
        name: 'category1',
        parent: 5
    },{
        id: 7,
        name: 'category1',
        parent: 5
    },{
        id: 8,
        name: 'category1',
        parent: 2
    },{
        id: 9,
        name: 'category1'
    }
]

function getItems(obj, items) {
    let result =  items.filter(function(item) {
        return item.parent === obj.id;
    })
    return result;
}

function nestedItem(items) {
   let result = [];
    items.forEach(function(item) {
        let res = getItems(item, items)
        console.log(res)
        if (res.length > 0) {
            item.items = res;
        }
        if (!item.parent) {
            result.push(item)
        }
    })
    return result;
}

let res = nestedItem(items);



console.log(JSON.stringify(res, null, 4))*/
