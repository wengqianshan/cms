'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 分类模型
 */
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
 * 分类嵌套格式获取方法示例
 * 
let items = [
    {
        id: 1,
        name: '顶级分类1'
    },{
        id: 2,
        name: '顶级分类1'
    },{
        id: 3,
        name: '顶级分类1',
        parent: 1
    },{
        id: 4,
        name: '顶级分类1',
        parent: 2
    },{
        id: 5,
        name: '顶级分类1',
        parent: 3
    },{
        id: 6,
        name: '顶级分类1',
        parent: 5
    },{
        id: 7,
        name: '顶级分类1',
        parent: 5
    },{
        id: 8,
        name: '顶级分类1',
        parent: 2
    },{
        id: 9,
        name: '顶级分类1'
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