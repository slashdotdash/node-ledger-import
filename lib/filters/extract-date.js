var _ = require('lodash'),
    moment = require('moment');

var extractDate = function(options) {
  options = _.defaults(options, { format: 'DD/MM/YYYY' });

  return function(input, next) {
    var date = input.data[options.column - 1];

    try {
      date = moment(date, options.format, true);

      if (date.isValid()) {
        next(null, _.merge(input, { date: date.toDate() }));
      } else {
        next('Failed to parse date "' + date + '" (using format "' + options.format + '").');
      }
    } catch(e) {
      next('Failed to parse date "' + date + '" (using format "' + options.format + '"). ' + e);
    }
  };
};

module.exports = extractDate;