var moment = require('moment');

var numberWithSeparator = function(amount, separator) {
  var regex = /(\d+)(\d{3})/;

  return amount.toString().replace(/^\d+/, function(w) {
    while (regex.test(w)) {
      w = w.replace(regex, '$1' + separator + '$2');
    }
    return w;
  });
};

var formatMoney = function(amount, currency) {
  return currency + numberWithSeparator(amount.toFixed(2), ',');
};

var formatTransaction = function(options) {
  if (!options.account) {
    throw {
      name: 'OptionsError',
      message: 'Account has not been specified'
    };
  }

  if (!options.currency) {
    throw {
      name: 'OptionsError',
      message: 'Currency has not been specified'
    };
  }

  return function(input, next) {
    var destination, source, amount;

    if (input.amount > 0) {
      destination = options.account;
      source = input.account;
      amount = input.amount;
    } else {
      destination = input.account;
      source = options.account;
      amount = -1 * input.amount;
    }

    var formatted = [
      moment(input.date).format('YYYY/MM/DD') + ' ' + input.payee,
      '\t' + destination + '\t\t' + formatMoney(amount, options.currency),
      '\t' + source
    ].join('\n');

    input.formatted = formatted;

    next(null, input);
  };
};

module.exports = formatTransaction;