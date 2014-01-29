var fs = require('fs'),
    temp = require('temp'),
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

  // automatically track and cleanup files at exit
  temp.track();

  return function(input, next) {
    temp.open('ledger', function(err, tmp) {
      if (err) {
        return next(err);
      }

      var reader = fs.createReadStream(options.ledger, { flags: 'r', encoding: 'utf-8' }),
          writer = fs.createWriteStream(tmp.path, { flags: 'w', encoding: 'utf-8' });

      reader.pipe(writer, { end: false });
      
      // append transactions after pipe'ing source Ledger file to tmp output file
      reader.once('end', function() {
        writer.write('\n' + format(input.transactions));
        writer.end();
      });

      writer.once('error', function(err) {
        next(err);
      });

      writer.once('finish', function() {
        input.outputPath = tmp.path;

        next(null, input);
      });
    });
  };
};

module.exports = writeLedger;