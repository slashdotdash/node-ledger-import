var _ = require('lodash'),
    moment = require('moment'),
    prompt = require('prompt');

var promptForAccount = function(input, next) {
  var accounts = _(input.transactions)
    .map(function(transaction) { return transaction.postings; })
    .flatten()
    .map(function(posting) { return posting.account; })
    .uniq()
    .sortBy(function(account) { return account; })
    .value();

  console.log('Choose the account:');
  _.each(accounts, function(account, i) { console.log((i + 1) + ': ' + account); });

  (function promptUser() {
    prompt.get(['account'], function(err, response) {
      if (err) {
        return next(err);
      }

      var index = parseInt(response.account, 10);

      // ensure the user enters a valid number
      if (_.isNaN(index)) {
        console.error('please enter a number');
        return promptUser();
      }

      input.account = accounts[index - 1];

      next(null, input);
    });
  })();
};

// prompt user to confirm the transaction details
var confirmTransaction = function() {
  prompt.message = '';
  prompt.delimiter = '';
  
  prompt.start();

  return function(input, next) {
    var date = new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
        payee = input.payee,
        account = input.account,
        amount = input.amount,
        destination = amount > 0 ? 'source' : 'recipient';

    console.log('');
    console.log(moment(date).format('YYYY-MM-DD'), payee, amount);

    prompt.get({
      properties: {
        response: {
          description: 'Confirm "' + account + '" was the ' + destination + '? ([Y]es/[n]o/[q]uit/[s]kip): '.green
        }
      }
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      switch((result.response || 'y').substr(0, 1).toLowerCase()) {
      case 'y':
        next(null, input);
        break;
      case 'n':
        promptForAccount(input, next);
        break;
      case 'q':
        process.exit(1);
        break;
      case 's':
        input.skip = true;
        next(null, input);
        break;
      }
    });
  };
};

module.exports = confirmTransaction;