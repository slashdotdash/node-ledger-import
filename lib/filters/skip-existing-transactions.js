var _ = require('lodash'),
    moment = require('moment');

var formatPayee = function(payee) {
  return payee.trim().replace('\'', '');
};

var mapToDateAndPayee = _.memoize(function(transactions) {
  return _.map(transactions, function(transaction) {
    return {
      date: new Date(transaction.date.getFullYear(), transaction.date.getMonth(), transaction.date.getDate()),
      payee: formatPayee(transaction.payee)
    };
  });
});

var skipExistingTransactions = function() {
  return function(input, next) {
    var transactions = mapToDateAndPayee(input.transactions),
        date = new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
        payee = formatPayee(input.payee);

    var exists = _.any(transactions, function(transaction) {
      return moment(transaction.date).isSame(moment(date)) &&
        payee === transaction.payee;
    });
    
    if (exists) {
      next(null, _.merge(input, { exists: true }));
    } else {
      next(null, input);
    }
  };
};

module.exports = skipExistingTransactions;