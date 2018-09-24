const _ = require('lodash');
const CURRENT = 1;
const PAGE_SIZE = 20;

module.exports = {
  parse(query = {}) {
    let { current, pageSize } = query;
    current = _.toNumber(current);
    if (_.isNaN(current)) {
      current = CURRENT;
    }
    pageSize = _.toNumber(pageSize);
    if (_.isNaN(pageSize)) {
      pageSize = PAGE_SIZE;
    }
    return {
      current,
      pageSize,
    };
  }
}
