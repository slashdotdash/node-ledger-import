var _ = require('lodash');

var trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

var parseCSV = function(options) {
  return function(input, next) {
    var transactions = [],
        count = 0;

    input.csv.on('record', function(row, index) {
      // trim each column
      row = _.map(row, trim);

      // skip empty rows
      if (row.length === 0 || _.all(row, function(column) { return column.length === 0; })) {
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
      input.transactions = transactions;
      input.count = count;

      next(null, input);
    })
    .on('error', function(error) {
      next(error);
    });
  };
};

module.exports = parseCSV;