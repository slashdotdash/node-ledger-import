var Ledger = require('ledger-cli').Ledger;

var parseLedgerAccounts = function(ledger, done) {
  var accounts = [];

  ledger.accounts()
    .on('data', function(entry) {
      accounts.push(entry);
    })
    .once('end', function() {
      // completed
      done(null, accounts);
    })
    .on('error', function(error) {
      // error
      done(error);
    });
};

var retrieveAccounts = function(options) {
  if (!options.ledger) {
    throw {
      name: 'OptionsError',
      message: 'Ledger file has not been specified'
    };
  }

  var ledger = new Ledger({ file: options.ledger });

  return function(input, next) {
    parseLedgerAccounts(ledger, function(err, accounts) {
      if (err) {
        return next('Failed to parse accounts in Ledger file "' + options.ledger + '". ' + err);
      }

      input.accounts = accounts;

      next(null, input);
    });
  };
};

module.exports = retrieveAccounts;