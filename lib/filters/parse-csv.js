var _ = require('lodash');

var parseCSV = function(options) {
  return function(input, next) {
    var transactions = [],
        count = 0;

    input.csv.on('record', function(row, index) {
      // skip empty rows
      if (row.length === 0 || row.length === 1) {
        return;
      }
      
      // skip header
      if (options.header && count === 0) {
        count++;
        return;
      }
      
      // push the CSV row onto the transactions list
      transactions.push({ data: row, index: index });
    })
    .once('end', function(count) {
      next(null, _.merge(input, { transactions: transactions, count: count }));
    })
    .on('error', function(error) {
      next(error);
    });
  };
};

module.exports = parseCSV;