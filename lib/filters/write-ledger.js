var fs = require('fs'),
    _ = require('lodash');

// format the transactions for output to a Ledger .dat file
var format = function(transactions) {
  return _.map(transactions, function(transaction) {
    return transaction.formatted;
  }).join('\n\n');
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
      output.write('\n' + format(input.transactions));
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