/**
 * user
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let moment = require('moment')
let util = require('../lib/util');
let User = mongoose.model('User');


let Base = require('./base');

class Service extends Base {
  constructor(props) {
    super(props);
    this.Model = User;
  }

  login(id, populates) {
    return new Promise(function (resolve, reject) {
      resolve('success');
    })
  }

  trend() {
    let now = new Date()
    let lastMonth = moment().subtract(3, 'month').format()
    return new Promise((resolve, reject) => {
      this.Model.aggregate({
        $match: {
          created: { '$gt': new Date(lastMonth) }
        }
      }, {
          $project: {
            d: { $add: ['$created', 28800000] }
          }
        }, {
          $project: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$d' } }
          }
        }, {
          $group: {
            _id: '$day',
            total: { $sum: 1 }
          }
        }, {
          $sort: {
            _id: -1
          }
        }).exec((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
    })
  }

}

module.exports = Service;
