var Ledger = require('ledger-cli').Ledger;

var parseLedgerTransactions = function(ledger, done) {
  var transactions = [];

  ledger.register()
    .on('data', function(entry) {
      transactions.push(entry);
    })
    .once('end', function(){
      // completed
      done(null, transactions);
    })
    .on('error', function(error) {
      // error
      done(error);
    });
};

var parseLedger = function(options) {
  if (!options.ledger) {
    throw {
      name: 'OptionsError',
      message: 'Ledger file has not been specified'
    };
  }

  var ledger = new Ledger({ file: options.ledger }),
      cached;

  return function(input, next) {
    if (cached) {
      input.transactions = cached;
      
      return next(null, input);
    }

    parseLedgerTransactions(ledger, function(err, transactions) {
      if (err) {
        return next('Failed to parse transactions in Ledger file "' + options.ledger + '". ' + err);
      }

      // cache transactions for subsequent calls to this filter
      cached = transactions;

      input.transactions = transactions;

      next(null, input);
    });
  };
};

module.exports = parseLedger;