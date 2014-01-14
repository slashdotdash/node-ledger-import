var _ = require('lodash');

var parseAmount = function(options, input, amount, next) {
  if (!amount) {
    return next('Failed to extract amount - it was empty');
  }

  try {
    amount = parseFloat(amount, 10);
  } catch(ex) {
    return next('Failed to parse amount "' + amount + '". ' + ex);
  }

  if (options.inverse) {
    amount = amount * -1;
  }

  return next(null, _.merge(input, { amount: amount }));
};

var extractFromSingleColumn = function(options, input, next) {
  var amount = input.data[options.column - 1];

  parseAmount(options, input, amount, next);
};

var extractFromMultiColumns = function(options, input, next) {
  var from = input.data[options.from.column - 1],
      to = input.data[options.to.column - 1];

  if (from) {
    return parseAmount(options.from, input, from, next);
  }

  if (to) {
    return parseAmount(options.to, input, to, next);
  }

  next('Failed to parse amount');
};

var extractAmount = function(options) {
  if (!options.column && (!options.from && !options.to)) {
    throw {
      name: 'OptionsError',
      message: 'Amount column has not been specified'
    };
  }

  if (options.from && options.to) {
    if (!options.from.column) {
      throw {
        name: 'OptionsError',
        message: 'Amount from column has not been specified'
      };
    }

    if (!options.to.column) {
      throw {
        name: 'OptionsError',
        message: 'Amount to column has not been specified'
      };
    }
  }

  return function(input, next) {
    if (options.column) {
      return extractFromSingleColumn(options, input, next);
    }
    
    return extractFromMultiColumns(options, input, next);
  };
};

module.exports = extractAmount;