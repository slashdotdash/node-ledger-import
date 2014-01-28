var fs = require('fs'),
    _ = require('lodash');

// write out the formatted transactions
var writeTransactions = function(output, transactions) {
  _.each(transactions, function(transaction) {
    output.write('\n\n');
    output.write(transaction.formatted);
  });
};

var writeLedger = function(options) {
  if (!options.ledger) {
    throw {
      name: 'OptionsError',
      message: 'Ledger output file has not been specified'
    };
  }

  var path = options.ledger + '.tmp';

  return function(input, next) {
    var output = fs.createWriteStream(path, { flags: 'a', encoding: 'utf-8' });

    output.once('open', function() {
      writeTransactions(output, input.transactions);
      output.end();
    });

    output.once('error', function(err) {
      next(err);
    });

    output.once('finish', function() {
      next(null, input);
    });
  };
};

module.exports = writeLedger;