/**
 * category
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Category = mongoose.model('Category');
let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = Category;
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
}

module.exports = Service;


// let baseServices = require('./base')(Category);

// let services = {
//     findBySome: function(id, populates) {
//         return new Promise(function(resolve, reject) {
//             let query = Category.findById(id)
//             if (populates && populates.length > 0) {
//                 populates.forEach(function(item) {
//                     query = query.populate(item);
//                 })
//             }
//             query.exec(function(err, result) {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve(result)
//                 }
//             });
//         })
//     }
// };

// module.exports = _.assign({}, baseServices, services);
