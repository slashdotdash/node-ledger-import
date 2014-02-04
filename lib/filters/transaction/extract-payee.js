var trim = function(str) {
  return str.replace(/^[^\w+]/g, '');
};

var extractPayee = function(options) {
  if (!options.column) {
    throw {
      name: 'OptionsError',
      message: 'Payee column has not been specified'
    };
  }

  return function(input, next) {
    var payee = input.data[options.column - 1];

    if (payee && payee.length > 0) {
      input.payee = trim(payee);

      next(null, input);
    } else {
      next('Failed to extract payee');
    }
  };
};

module.exports = extractPayee;