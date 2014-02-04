var _ = require('lodash');

var clean = function(str) {
  return str.replace(/[^0-9\-\.]/g, '');
};


var parseAmount = function(options, input, amount, next) {
  if (!amount) {
    return next('Failed to extract amount - it was empty');
  }

  try {
    if (_.isString(amount)) {
      amount = parseFloat(clean(amount), 10);
    }
  } catch(ex) {
    return next('Failed to parse amount "' + amount + '". ' + ex);
  }

  if (options.inverse) {
    amount = amount * -1;
  }

  input.amount = amount;

  return next(null, input);
};

var extractFromSingleColumn = function(options, input, next) {
  var amount = input.data[options.column - 1];

  parseAmount(options, input, amount, next);
};

var extractFromMultipleColumns = function(options, input, next) {
  var amounts = _.map(options.columns, function(column) {
    var amount = input.data[column - 1];
    if (_.isString(amount)) {
      amount = parseFloat(clean(input.data[column - 1]), 10);
    }
    return amount;
  });

  var amount = _.find(amounts, function(number) {
    return _.isNumber(number) && !_.isNaN(number);
  });

  if (amount) {
    parseAmount(options, input, amount, next);
  } else {
    next('Failed to find an amount from columns ' + options.columns.join(', '));
  }
  
};

var extractAmount = function(options) {
  if (!options.column && !options.columns) {
    throw {
      name: 'OptionsError',
      message: 'Amount column has not been specified'
    };
  }

  return function(input, next) {
    if (options.column) {
      return extractFromSingleColumn(options, input, next);
    }
    
    if (options.columns) {
      return extractFromMultipleColumns(options, input, next);
    }

    next('Failed to extract amount');
  };
};

module.exports = extractAmount;