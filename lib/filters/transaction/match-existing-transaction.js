var _ = require('lodash'),
    moment = require('moment');

var formatPayee = function(payee) {
  return payee.trim().replace('\'', '');
};

var mapToDateAndPayee = function(transactions) {
  return _.map(transactions, function(transaction) {
    return {
      date: moment(new Date(transaction.date.getFullYear(), transaction.date.getMonth(), transaction.date.getDate())),
      payee: formatPayee(transaction.payee)
    };
  });
};

var matchExistingTransaction = function() {
  var transactions;

  return function(input, next) {
    var date = moment(new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate())),
        payee = formatPayee(input.payee);

    if (!transactions) {
      transactions = mapToDateAndPayee(input.transactions);
    }

    var exists = _.any(transactions, function(transaction) {
      return payee === transaction.payee && transaction.date.isSame(date);
    });

    input.exists = exists;
    
    next(null, input);
  };
};

module.exports = matchExistingTransaction;