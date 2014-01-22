var _ = require('lodash'),
    moment = require('moment'),
    program = require('commander');

var promptForAccount = function(input, next) {
  var accounts = _(input.transactions)
    .map(function(transaction) { return transaction.postings; })
    .flatten()
    .map(function(posting) { return posting.account; })
    .uniq()
    .sortBy(function(account) { return account; })
    .value();

  console.log('Choose the account:');
  program.choose(accounts, function(i) {
    next(null, _.merge(input, { account: accounts[i] }));
  });
};

// prompt user to confirm the transaction details
var confirmTransaction = function() {
  return function(input, next) {
    var date = new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
        payee = input.payee,
        account = input.account,
        amount = input.amount,
        destination = amount > 0 ? 'source' : 'recipient';

    console.log('');
    console.log(moment(date).format('YYYY-MM-DD'), payee, amount);
    program.prompt('Confirm "' + account + '" was the ' + destination + '? ([Y]es/[n]o/[q]uit/[s]kip): ', function(response) {
      switch((response || 'y').substr(0, 1).toLowerCase()) {
      case 'y':
        next(null, _.merge(input, { }));
        break;
      case 'n':
        promptForAccount(input, next);
        break;
      case 'q':
        process.exit(1);
        break;
      case 's':
        next(null, _.merge(input, { skip: true }));
        break;
      }
    });
  };
};

module.exports = confirmTransaction;